import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { User } from '../users/user.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { UserBox, UserBoxStatus } from '../user-boxes/entities/user-box.entity';
import { Item } from '../items/entities/item.entity';
import { CreateUserBoxDto } from '../user-boxes/dto/create-user-box.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
        @InjectRepository(UserBox)
        private readonly userBoxRepository: Repository<UserBox>,
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        private readonly dataSource: DataSource,
    ) { }

    // 购买盲盒 - 在购买时就确定内容并扣减库存
    async purchase(userId: number, createUserBoxDto: CreateUserBoxDto): Promise<{ order: Order, userBoxes: any[] }> {
        const { curioBoxId, quantity = 1 } = createUserBoxDto;

        // 查找盲盒
        const curioBox = await this.curioBoxRepository.findOne({
            where: { id: curioBoxId },
        });

        if (!curioBox) {
            throw new NotFoundException(`CurioBox #${curioBoxId} not found`);
        }

        // 使用事务确保订单创建和用户盒子创建的一致性
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 创建订单
            const order = this.orderRepository.create({
                userId,
                curioBoxId,
                price: curioBox.price * quantity,
                status: OrderStatus.COMPLETED,
            });
            await queryRunner.manager.save(order);

            // 购买后盲盒数量减少
            if (typeof curioBox.boxCount === 'number') {
                curioBox.boxCount = Math.max(0, curioBox.boxCount - quantity);
                await queryRunner.manager.save(curioBox);
            }

            // 创建用户盒子（在购买时就确定内容）
            const userBoxes = await this.purchaseBoxes(userId, createUserBoxDto, queryRunner);

            await queryRunner.commitTransaction();
            return { order, userBoxes };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    // 迁移自 user-boxes.service.ts
    // 批量购买盲盒 - 在购买时就确定内容
    async purchaseBoxes(userId: number, createUserBoxDto: CreateUserBoxDto, queryRunner?): Promise<UserBox[]> {
        const { curioBoxId, quantity = 1 } = createUserBoxDto;
        const curioBox = await this.curioBoxRepository.findOne({
            where: { id: curioBoxId },
            relations: ['items'],
        });
        if (!curioBox) {
            throw new NotFoundException(`CurioBox #${curioBoxId} not found`);
        }
        if (!curioBox.items || curioBox.items.length === 0) {
            throw new BadRequestException(`CurioBox #${curioBoxId} has no items`);
        }
        // 使用事务确保库存一致性
        let localQueryRunner = queryRunner;
        let createdHere = false;
        if (!localQueryRunner) {
            localQueryRunner = this.dataSource.createQueryRunner();
            await localQueryRunner.connect();
            await localQueryRunner.startTransaction();
            createdHere = true;
        }
        try {
            const userBoxes: UserBox[] = [];
            for (let i = 0; i < quantity; i++) {
                // 在购买时执行抽奖
                const drawnItem = await this.drawItem(curioBox);
                // 检查库存
                if (drawnItem.stock <= 0) {
                    throw new BadRequestException(`Item ${drawnItem.name} is out of stock`);
                }
                // 减少库存
                drawnItem.stock--;
                await localQueryRunner.manager.save(drawnItem);
                // 创建用户盲盒，已经包含确定的物品
                const userBox = localQueryRunner.manager.create(UserBox, {
                    userId,
                    curioBoxId,
                    status: UserBoxStatus.UNOPENED,
                    itemId: drawnItem.id,
                });
                const savedUserBox = await localQueryRunner.manager.save(userBox);
                userBoxes.push(savedUserBox);
            }
            if (createdHere) {
                await localQueryRunner.commitTransaction();
            }
            // 事务提交后，重新查一遍 userBoxes，确保能查到
            const savedUserBoxes = await this.userBoxRepository.find({
                where: { userId, curioBoxId, status: UserBoxStatus.UNOPENED },
                order: { id: 'ASC' },
            });
            return savedUserBoxes.slice(0, quantity);
        } catch (err) {
            if (createdHere) {
                await localQueryRunner.rollbackTransaction();
            }
            throw err;
        } finally {
            if (createdHere) {
                await localQueryRunner.release();
            }
        }
    }

    // 抽奖逻辑 - 现在在购买时调用
    private async drawItem(curioBox: CurioBox): Promise<Item> {
        const { items, itemProbabilities } = curioBox;
        // 检查是否有可用物品
        const availableItems = items.filter(item => item.stock > 0);
        if (availableItems.length === 0) {
            throw new BadRequestException('No items available in the box');
        }
        // 根据概率抽取物品
        const rand = Math.random();
        let sum = 0;
        for (const prob of itemProbabilities) {
            sum += prob.probability;
            if (rand <= sum) {
                const item = availableItems.find(i => i.id === prob.itemId);
                if (item && item.stock > 0) {
                    return item;
                }
            }
        }
        // 如果所有物品都没库存，抛出异常
        throw new BadRequestException('No items available in the box');
    }

    // 查找用户的所有订单
    async findAllByUser(userId: number): Promise<Order[]> {
        return this.orderRepository.find({
            where: { userId },
            relations: ['curioBox'],
            order: { createdAt: 'DESC' },
        });
    }

    // 查找单个订单
    async findOne(id: number, userId: number): Promise<Order | null> {
        return this.orderRepository.findOne({
            where: { id, userId },
            relations: ['curioBox'],
        });
    }
}