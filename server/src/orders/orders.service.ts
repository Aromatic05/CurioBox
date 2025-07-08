import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/user.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { OrderStatus } from './entities/order.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * 核心抽奖逻辑
     */
    async draw(createOrderDto: CreateOrderDto, user: any): Promise<Order> {
        const { curioBoxId } = createOrderDto;

        // 查找用户
        const dbUser = await this.userRepository.findOne({ where: { id: user.id || user.sub } });
        if (!dbUser) throw new NotFoundException('User not found');

        // 查找盲盒，并加载其中包含的所有物品
        const curioBox = await this.curioBoxRepository.findOne({
            where: { id: curioBoxId },
            relations: ['items'],
        });

        if (!curioBox) {
            throw new NotFoundException(`CurioBox with ID "${curioBoxId}" not found`);
        }

        if (!curioBox.items || curioBox.items.length === 0) {
            throw new BadRequestException(`CurioBox with ID "${curioBoxId}" has no items to draw from`);
        }

        // --- 加权随机算法 ---
        const totalWeight = curioBox.items.reduce((sum, item) => sum + item.weight, 0);
        let randomWeight = Math.random() * totalWeight;

        let drawnItem = curioBox.items[0]; // 默认值
        for (const item of curioBox.items) {
            randomWeight -= item.weight;
            if (randomWeight <= 0) {
                drawnItem = item;
                break;
            }
        }
        // --- 算法结束 ---

        const order = this.orderRepository.create({
            price: curioBox.price,
            user: dbUser,
            userId: dbUser.id,
            curioBox: curioBox,
            curioBoxId: curioBox.id,
            drawnItem: drawnItem,
            drawnItemId: drawnItem.id,
        });
        try {
            const savedOrder = await this.orderRepository.save(order);
            // 用 plainToInstance 转换返回对象，保证 price 为字符串
            const result = plainToInstance(Order, {
                ...savedOrder,
                price: savedOrder.price.toString(),
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 查找当前用户的所有订单
     */
    findAllForUser(user: User): Promise<Order[]> {
        return this.orderRepository.find({
            where: { user: { id: user.id } },
            relations: ['curioBox', 'drawnItem'], // 同时加载关联信息
            order: { createdAt: 'DESC' }, // 按创建时间降序
        });
    }

    /**
     * 查找单个订单，并校验所有权
     */
    async findOneForUser(id: number, user: User): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id, user: { id: user.id } },
            relations: ['curioBox', 'drawnItem', 'user'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found or you don't have access`);
        }

        return order;
    }

    /**
     * 更新订单状态
     */
    async updateStatus(id: number, status: OrderStatus, user: User): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id, user: { id: user.id } } });
        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found or you don't have access`);
        }
        order.status = status;
        return this.orderRepository.save(order);
    }

    /**
     * 删除订单（仅允许本人删除）
     */
    async remove(id: number, user: User): Promise<void> {
        const order = await this.orderRepository.findOne({ where: { id, user: { id: user.id } } });
        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found or you don't have access`);
        }
        await this.orderRepository.remove(order);
    }
}