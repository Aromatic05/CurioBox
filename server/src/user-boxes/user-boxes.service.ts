import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserBox, UserBoxStatus } from './entities/user-box.entity';
import { CreateUserBoxDto } from './dto/create-user-box.dto';
import { OpenBoxDto } from './dto/open-box.dto';
import {
    OpenBoxResultDto,
    BatchOpenBoxResultDto,
} from './dto/open-box-result.dto';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/user.entity';

@Injectable()
export class UserBoxesService {
    constructor(
        @InjectRepository(UserBox)
        private readonly userBoxRepository: Repository<UserBox>,
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        private readonly dataSource: DataSource,
    ) {}

    // 批量购买盲盒 - 在购买时就确定内容
    // async purchaseBoxes(userId: number, createUserBoxDto: CreateUserBoxDto): Promise<UserBox[]> {
    //     const { curioBoxId, quantity = 1 } = createUserBoxDto;

    //     const curioBox = await this.curioBoxRepository.findOne({
    //         where: { id: curioBoxId },
    //         relations: ['items'],
    //     });

    //     if (!curioBox) {
    //         throw new NotFoundException(`CurioBox #${curioBoxId} not found`);
    //     }

    //     if (!curioBox.items || curioBox.items.length === 0) {
    //         throw new BadRequestException(`CurioBox #${curioBoxId} has no items`);
    //     }

    //     // 使用事务确保库存一致性
    //     const queryRunner = this.dataSource.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();

    //     try {
    //         const userBoxes: UserBox[] = [];

    //         for (let i = 0; i < quantity; i++) {
    //             // 在购买时执行抽奖
    //             const drawnItem = await this.drawItem(curioBox);

    //             // 检查库存
    //             if (drawnItem.stock <= 0) {
    //                 throw new BadRequestException(`Item ${drawnItem.name} is out of stock`);
    //             }

    //             // 减少库存
    //             drawnItem.stock--;
    //             await queryRunner.manager.save(drawnItem);

    //             // 创建用户盲盒，已经包含确定的物品
    //             const userBox = queryRunner.manager.create(UserBox, {
    //                 userId,
    //                 curioBoxId,
    //                 status: UserBoxStatus.UNOPENED,
    //                 itemId: drawnItem.id,
    //             });

    //             const savedUserBox = await queryRunner.manager.save(userBox);
    //             userBoxes.push(savedUserBox);
    //         }

    //         await queryRunner.commitTransaction();
    //         // 事务提交后，重新查一遍 userBoxes，确保能查到
    //         const savedUserBoxes = await this.userBoxRepository.find({
    //             where: { userId, curioBoxId, status: UserBoxStatus.UNOPENED },
    //             order: { id: 'ASC' },
    //         });
    //         return savedUserBoxes.slice(0, quantity);
    //     } catch (err) {
    //         await queryRunner.rollbackTransaction();
    //         throw err;
    //     } finally {
    //         await queryRunner.release();
    //     }
    // }

    // 获取用户未开启的盲盒列表
    async findUserUnopenedBoxes(userId: number): Promise<UserBox[]> {
        return this.userBoxRepository.find({
            where: {
                userId,
                status: UserBoxStatus.UNOPENED,
            },
            relations: ['curioBox'],
            order: { purchaseDate: 'DESC' },
        });
    }

    // 根据状态获取用户盲盒列表
    async findUserBoxesByStatus(
        userId: number,
        status: 'UNOPENED' | 'OPENED',
    ): Promise<UserBox[]> {
        return this.userBoxRepository.find({
            where: {
                userId,
                status:
                    status === 'OPENED'
                        ? UserBoxStatus.OPENED
                        : UserBoxStatus.UNOPENED,
            },
            relations: ['curioBox', 'item'],
            order: { purchaseDate: 'DESC' },
        });
    }

    // 获取用户所有盲盒（不区分状态）
    async findAllUserBoxes(userId: number): Promise<UserBox[]> {
        return this.userBoxRepository.find({
            where: { userId },
            relations: ['curioBox', 'item'],
            order: { purchaseDate: 'DESC' },
        });
    }

    // 开启单个盲盒 - 只修改状态，不再抽奖
    private async openSingleBox(
        userBoxId: number,
        userId: number,
    ): Promise<OpenBoxResultDto> {
        const userBox = await this.userBoxRepository.findOne({
            where: { id: userBoxId, userId },
            relations: ['item'],
        });

        if (!userBox) {
            throw new NotFoundException(`UserBox #${userBoxId} not found`);
        }

        if (userBox.status === UserBoxStatus.OPENED) {
            throw new BadRequestException(
                `UserBox #${userBoxId} has already been opened`,
            );
        }

        // 只修改状态为已开启
        userBox.status = UserBoxStatus.OPENED;
        await this.userBoxRepository.save(userBox);

        return {
            userBoxId,
            drawnItem: userBox.item,
            success: true,
        };
    }

    // 批量开启盲盒
    async openBoxes(
        userId: number,
        openBoxDto: OpenBoxDto,
    ): Promise<BatchOpenBoxResultDto> {
        const userBoxIds =
            openBoxDto.userBoxIds ||
            (openBoxDto.userBoxId ? [openBoxDto.userBoxId] : []);

        if (userBoxIds.length === 0) {
            throw new BadRequestException(
                'No userBoxId or userBoxIds provided',
            );
        }

        const results: OpenBoxResultDto[] = [];
        let allSuccess = true;

        for (const userBoxId of userBoxIds) {
            try {
                const result = await this.openSingleBox(userBoxId, userId);
                results.push(result);
            } catch (err) {
                allSuccess = false;
                results.push({
                    userBoxId,
                    drawnItem: null,
                    success: false,
                }); // 用 as any 绕过类型检查
            }
        }

        return {
            results,
            totalOpened: results.filter((r) => r.success).length,
            allSuccess,
        };
    }

    // 抽奖逻辑 - 现在在购买时调用
    private async drawItem(curioBox: CurioBox): Promise<Item> {
        const { items, itemProbabilities } = curioBox;

        // 检查是否有可用物品
        const availableItems = items.filter((item) => item.stock > 0);
        if (availableItems.length === 0) {
            throw new BadRequestException('No items available in the box');
        }

        // 根据概率抽取物品
        const rand = Math.random();
        let sum = 0;
        for (const prob of itemProbabilities) {
            sum += prob.probability;
            if (rand <= sum) {
                const item = availableItems.find((i) => i.id === prob.itemId);
                if (item && item.stock > 0) {
                    return item;
                }
            }
        }

        // 如果所有物品都没库存，抛出异常
        throw new BadRequestException('No items available in the box');
    }
}
