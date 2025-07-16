import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { UserBox, UserBoxStatus } from './entities/user-box.entity';
import { OpenBoxDto } from './dto/open-box.dto';
import {
    OpenBoxResultDto,
    BatchOpenBoxResultDto,
} from './dto/open-box-result.dto';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { Item } from '../items/entities/item.entity';
import { UserItemsService } from '../items/user-items.service';

@Injectable()
export class UserBoxesService {
    constructor(
        @InjectRepository(UserBox)
        private readonly userBoxRepository: Repository<UserBox>,
        // CurioBox 和 Item 的 Repository 可能在查询方法中仍有用
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        private readonly dataSource: DataSource,
        private readonly userItemsService: UserItemsService,
    ) { }

    // --- 查询方法保持不变 ---

    // 根据状态获取用户盲盒列表
    async findUserBoxesByStatus(
        userId: number,
        status: 'UNOPENED' | 'OPENED' | 'ALL',
    ): Promise<UserBox[]> {
        const whereCondition: { userId: number; status?: UserBoxStatus } = { userId };
        if (status !== 'ALL') {
            whereCondition.status =
                status === 'OPENED'
                    ? UserBoxStatus.OPENED
                    : UserBoxStatus.UNOPENED;
        }

        return this.userBoxRepository.find({
            where: whereCondition,
            relations: ['curioBox', 'item'],
            order: { purchaseDate: 'DESC' },
        });
    }

    /**
     * 批量开启盲盒。
     * 采用“全部成功或全部失败”的事务策略，保证数据一致性。
     */
    async openBoxes(
        requestingUserId: number, // <--- 关键修改：重命名参数，避免混淆
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

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const results: OpenBoxResultDto[] = [];
        try {
            const userBoxes = await queryRunner.manager.find(UserBox, {
                where: {
                    id: In(userBoxIds),
                    userId: requestingUserId, // <--- 使用重命名后的参数进行查询
                },
                relations: ['item'],
            });

            if (userBoxes.length !== userBoxIds.length) {
                const foundIds = userBoxes.map((box) => box.id);
                const notFoundIds = userBoxIds.filter(
                    (id) => !foundIds.includes(id),
                );
                throw new NotFoundException(
                    `UserBoxes with IDs [${notFoundIds.join(', ')}] not found or do not belong to the user.`,
                );
            }

            for (const userBox of userBoxes) {
                if (userBox.status === UserBoxStatus.OPENED) {
                    throw new BadRequestException(
                        `UserBox #${userBox.id} has already been opened.`,
                    );
                }

                userBox.status = UserBoxStatus.OPENED;
                await queryRunner.manager.save(userBox);

                if (userBox.itemId) {
                    // 现在，我们使用清晰的 requestingUserId 变量
                    await this.userItemsService.addItemInTransaction(
                        requestingUserId, // <--- 确保传递的是这个值
                        userBox.itemId,
                        1,
                        queryRunner,
                    );
                }

                results.push({
                    userBoxId: userBox.id,
                    drawnItem: userBox.item,
                    success: true,
                });
            }

            await queryRunner.commitTransaction();

            return {
                results,
                totalOpened: results.length,
                allSuccess: true,
            };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}