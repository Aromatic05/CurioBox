import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
// import { User } from '../users/user.entity'; // 虽然未使用，但保留以备将来之需
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
        // 注意：userBoxRepository 和 itemRepository 在此服务中不再直接用于写操作，
        // 而是通过 dataSource 和 queryRunner 进行，但保留注入以便于可能的读操作。
        @InjectRepository(UserBox)
        private readonly userBoxRepository: Repository<UserBox>,
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * 主购买流程：处理用户购买盲盒的请求。
     * @param userId - 发起购买的用户的ID。
     * @param createUserBoxDto - 包含盲盒ID和数量的DTO。
     * @returns 返回创建的订单和用户获得的盲盒列表。
     */
    async purchase(
        userId: number,
        createUserBoxDto: CreateUserBoxDto,
    ): Promise<{ order: Order; userBoxes: UserBox[] }> {
        const { curioBoxId, quantity = 1 } = createUserBoxDto;

        if (quantity <= 0) {
            throw new BadRequestException('Quantity must be a positive number.');
        }

        // 1. 查找盲盒，并一次性加载其所有关联的物品，这是关键修复点。
        const curioBox = await this.curioBoxRepository.findOne({
            where: { id: curioBoxId },
            relations: ['items'],
        });

        if (!curioBox) {
            throw new NotFoundException(`CurioBox #${curioBoxId} not found`);
        }

        // 2. 在进入事务前进行前置检查，提高效率。
        if (!curioBox.items || curioBox.items.length === 0) {
            throw new BadRequestException(
                `CurioBox #${curioBoxId} has no items and cannot be purchased.`,
            );
        }

        // 3. 使用事务确保所有数据库操作的原子性。
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 4. 在事务内创建订单。
            const order = this.orderRepository.create({
                userId,
                curioBoxId,
                price: curioBox.price * quantity,
                status: OrderStatus.COMPLETED,
            });
            await queryRunner.manager.save(order);

            // 5. 扣减盲盒总库存。
            if (typeof curioBox.boxCount === 'number') {
                if (curioBox.boxCount < quantity) {
                    throw new BadRequestException('Not enough boxes in stock.');
                }
                curioBox.boxCount -= quantity;
                await queryRunner.manager.save(curioBox);
            }

            // 6. 调用内部方法创建用户盲盒，并传递已加载的完整实体。
            const userBoxes = await this.createUserBoxesInTransaction(
                userId,
                quantity,
                curioBox, // 传递完整的实体，避免重复查询。
                queryRunner,
            );

            await queryRunner.commitTransaction();
            return { order, userBoxes };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            // 重新抛出错误，以便上层（如控制器）可以捕获并返回给客户端。
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 内部方法：在事务中为用户创建盲盒，并在购买时确定内容。
     * @param userId - 用户ID。
     * @param quantity - 购买数量。
     * @param curioBox - 包含物品信息的完整CurioBox实体。
     * @param queryRunner - 当前的数据库事务查询运行器。
     * @returns 返回创建的用户盲盒实体数组。
     */
    private async createUserBoxesInTransaction(
        userId: number,
        quantity: number,
        curioBox: CurioBox,
        queryRunner: QueryRunner,
    ): Promise<UserBox[]> {
        const createdUserBoxes: UserBox[] = [];
        for (let i = 0; i < quantity; i++) {
            // 抽奖以确定盲盒内容。
            const drawnItem = this.drawItem(curioBox);

            // 减少物品库存。drawItem已过滤无库存物品，此处作为最后防线和实际操作。
            drawnItem.stock--;
            await queryRunner.manager.save(drawnItem);

            // 创建用户盲盒，已包含确定的物品ID。
            const userBox = queryRunner.manager.create(UserBox, {
                userId,
                curioBoxId: curioBox.id,
                status: UserBoxStatus.UNOPENED,
                itemId: drawnItem.id,
                // 可选: 预加载item，这样返回给用户时就无需再次查询。
                item: drawnItem,
            });
            const savedUserBox = await queryRunner.manager.save(userBox);
            createdUserBoxes.push(savedUserBox);
        }

        // 直接返回在事务中创建的实体，它们已包含ID等持久化信息。
        return createdUserBoxes;
    }

    /**
     * 内部抽奖逻辑：根据概率从盲盒中抽取一个有库存的物品。
     * @param curioBox - 包含物品和概率信息的CurioBox实体。
     * @returns 返回抽中的Item实体。
     */
    private drawItem(curioBox: CurioBox): Item {
        const { items, itemProbabilities } = curioBox;

        // 1. 筛选出所有有库存的物品及其对应的概率。
        const availableItemsWithProb = itemProbabilities
            .map((prob) => {
                const item = items.find(
                    (i) => i.id === prob.itemId && i.stock > 0,
                );
                return item ? { item, probability: prob.probability } : null;
            })
            .filter(Boolean) as { item: Item; probability: number }[];

        if (availableItemsWithProb.length === 0) {
            throw new BadRequestException(
                'No items available in the box (all out of stock).',
            );
        }

        // 2. 归一化概率，以防总概率不为1。
        const totalProb = availableItemsWithProb.reduce(
            (sum, cur) => sum + cur.probability,
            0,
        );
        
        if (totalProb <= 0) {
            // 极端情况：有库存的物品概率总和为0
            throw new BadRequestException('Invalid probability configuration for available items.');
        }

        const normalizedProbs = availableItemsWithProb.map(
            ({ item, probability }) => ({
                item,
                probability: probability / totalProb,
            }),
        );

        // 3. 执行加权随机抽奖。
        const rand = Math.random();
        let cumulativeProb = 0;
        for (const { item, probability } of normalizedProbs) {
            cumulativeProb += probability;
            if (rand <= cumulativeProb) {
                return item;
            }
        }

        // 理论上由于浮点数精度问题，循环可能无法覆盖到1.0，
        // 在这种情况下，返回最后一个可用物品作为保底。
        return normalizedProbs[normalizedProbs.length - 1].item;
    }

    // --- 其他查询方法保持不变 ---

    /**
     * 查找指定用户的所有订单。
     * @param userId - 用户ID。
     * @returns 返回用户的订单列表。
     */
    async findAllByUser(userId: number): Promise<Order[]> {
        return this.orderRepository.find({
            where: { userId },
            relations: ['curioBox'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * 获取系统中的所有订单（通常用于管理后台）。
     * @returns 返回所有订单的列表。
     */
    async findAll(): Promise<Order[]> {
        return this.orderRepository.find({
            relations: ['curioBox', 'user'], // 可以考虑也关联user信息
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * 查找单个订单。
     * @param id - 订单ID。
     * @param userId - 用户ID（用于权限校验）。
     * @returns 返回单个订单实体，如果不存在或不属于该用户则返回null。
     */
    async findOne(id: number, userId?: number): Promise<Order | null> {
        const whereCondition: { id: number; userId?: number } = { id };
        if (typeof userId === 'number') {
            whereCondition.userId = userId;
        }
        return this.orderRepository.findOne({
            where: whereCondition,
            relations: ['curioBox', 'user'],
        });
    }
}