import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { User } from '../users/user.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { UserBoxesService } from '../user-boxes/user-boxes.service';
import { CreateUserBoxDto } from '../user-boxes/dto/create-user-box.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
        private readonly userBoxesService: UserBoxesService,
        private readonly dataSource: DataSource,
    ) {}

    // 购买盲盒
    async purchase(userId: number, createUserBoxDto: CreateUserBoxDto): Promise<{order: Order, userBoxes: any[]}> {
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

            // 创建用户盒子
            const userBoxes = await this.userBoxesService.purchaseBoxes(userId, createUserBoxDto);

            await queryRunner.commitTransaction();
            return { order, userBoxes };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    // 查找用户的所有订单
    async findAllByUser(userId: number): Promise<Order[]> {
        return this.orderRepository.find({
            where: { userId },
            relations: ['curioBox', 'drawnItem'],
            order: { createdAt: 'DESC' },
        });
    }

    // 查找单个订单
    async findOne(id: number, userId: number): Promise<Order | null> {
        return this.orderRepository.findOne({
            where: { id, userId },
            relations: ['curioBox', 'drawnItem'],
        });
    }
}