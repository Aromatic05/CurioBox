import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserBox, UserBoxStatus } from './entities/user-box.entity';
import { CreateUserBoxDto } from './dto/create-user-box.dto';
import { OpenBoxDto } from './dto/open-box.dto';
import { OpenBoxResultDto, BatchOpenBoxResultDto } from './dto/open-box-result.dto';
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

    // 批量购买盲盒
    async purchaseBoxes(userId: number, createUserBoxDto: CreateUserBoxDto): Promise<UserBox[]> {
        const { curioBoxId, quantity = 1 } = createUserBoxDto;

        const curioBox = await this.curioBoxRepository.findOne({
            where: { id: curioBoxId },
            relations: ['items'],
        });

        if (!curioBox) {
            throw new NotFoundException(`CurioBox #${curioBoxId} not found`);
        }

        const userBoxes = Array(quantity).fill(null).map(() => {
            const userBox = new UserBox();
            userBox.userId = userId;
            userBox.curioBoxId = curioBoxId;
            userBox.status = UserBoxStatus.UNOPENED;
            return userBox;
        });

        return this.userBoxRepository.save(userBoxes);
    }

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

    // 开启单个盲盒
    private async openSingleBox(userBoxId: number, userId: number): Promise<OpenBoxResultDto> {
        const userBox = await this.userBoxRepository.findOne({
            where: { id: userBoxId, userId },
            relations: ['curioBox'],
        });

        if (!userBox) {
            throw new NotFoundException(`UserBox #${userBoxId} not found`);
        }

        if (userBox.status === UserBoxStatus.OPENED) {
            throw new BadRequestException(`UserBox #${userBoxId} has already been opened`);
        }

        // 开启盲盒事务
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const curioBox = await this.curioBoxRepository.findOne({
                where: { id: userBox.curioBoxId },
                relations: ['items'],
            });

            if (!curioBox) {
                throw new NotFoundException(`CurioBox #${userBox.curioBoxId} not found`);
            }

            // 执行抽奖逻辑
            const drawnItem = await this.drawItem(curioBox);
            
            // 更新用户盲盒状态
            userBox.status = UserBoxStatus.OPENED;
            userBox.drawnItemId = drawnItem.id;
            await queryRunner.manager.save(userBox);

            // 减少物品库存
            drawnItem.stock--;
            await queryRunner.manager.save(drawnItem);

            await queryRunner.commitTransaction();

            return {
                userBoxId,
                drawnItem,
                success: true,
            };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    // 批量开启盲盒
    async openBoxes(userId: number, openBoxDto: OpenBoxDto): Promise<BatchOpenBoxResultDto> {
        const userBoxIds = openBoxDto.userBoxIds || (openBoxDto.userBoxId ? [openBoxDto.userBoxId] : []);

        if (userBoxIds.length === 0) {
            throw new BadRequestException('No userBoxId or userBoxIds provided');
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
                });
            }
        }

        return {
            results,
            totalOpened: results.filter(r => r.success).length,
            allSuccess,
        };
    }

    // 抽奖逻辑
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
}