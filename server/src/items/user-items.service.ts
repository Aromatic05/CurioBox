import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { UserItem } from './entities/user-item.entity';

@Injectable()
export class UserItemsService {
    constructor(
        @InjectRepository(UserItem)
        private readonly userItemRepo: Repository<UserItem>,
        // 注入 DataSource 以便管理事务
        private readonly dataSource: DataSource,
    ) { }

    /**
     * 查询指定用户的所有物品。这是一个只读操作，无需事务。
     * @param userId - 用户ID。
     */
    async findAllByUser(userId: number): Promise<UserItem[]> {
        return this.userItemRepo.find({
            where: { userId },
            relations: ['item'], // 建议关联 item 实体以获取物品详情
        });
    }

    /**
     * 为用户添加物品（公共方法）。
     * 此方法会自己管理事务，保证操作的原子性。
     * @param userId - 用户ID。
     * @param itemId - 物品ID。
     * @param count - 数量，默认为1。
     */
    async addItem(userId: number, itemId: number, count: number = 1): Promise<UserItem> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userItem = await this.addItemInTransaction(userId, itemId, count, queryRunner);
            await queryRunner.commitTransaction();
            return userItem;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 在一个已有的事务中为用户添加物品（内部方法）。
     * 被其他服务的事务性操作调用（如开盲盒）。
     * @param userId - 用户ID。
     * @param itemId - 物品ID。
     * @param count - 数量。
     * @param queryRunner - 调用者传入的 QueryRunner。
     */
    async addItemInTransaction(
        userId: number,
        itemId: number,
        count: number,
        queryRunner: QueryRunner,
    ): Promise<UserItem> {
        const manager = queryRunner.manager;
        let userItem = await manager.findOne(UserItem, { where: { userId, itemId } });

        if (userItem) {
            userItem.count += count;
        } else {
            userItem = manager.create(UserItem, { userId, itemId, count });
        }
        return manager.save(userItem);
    }

    /**
     * 减少或删除用户的物品（公共方法）。
     * 此方法会自己管理事务，保证操作的原子性。
     * @param userId - 用户ID。
     * @param itemId - 物品ID。
     * @param count - 要移除的数量。
     */
    async removeItem(userId: number, itemId: number, count: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await this.removeItemInTransaction(userId, itemId, count, queryRunner);
            await queryRunner.commitTransaction();
            return result;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 在一个已有的事务中减少或删除用户的物品（内部方法）。
     * @param userId - 用户ID。
     * @param itemId - 物品ID。
     * @param count - 要移除的数量。
     * @param queryRunner - 调用者传入的 QueryRunner。
     */
    async removeItemInTransaction(
        userId: number,
        itemId: number,
        count: number,
        queryRunner: QueryRunner,
    ) {
        const manager = queryRunner.manager;
        const userItem = await manager.findOne(UserItem, { where: { userId, itemId } });

        if (!userItem) {
            throw new NotFoundException(`User item with itemId #${itemId} not found for this user.`);
        }

        if (userItem.count < count) {
            throw new Error(`Not enough items. Trying to remove ${count}, but only have ${userItem.count}.`);
        }

        if (userItem.count === count) {
            // 如果数量正好相等，则删除记录
            await manager.remove(userItem);
            return { success: true, deleted: true };
        } else {
            // 否则，只减少数量
            userItem.count -= count;
            await manager.save(userItem);
            return { success: true, deleted: false, newCount: userItem.count };
        }
    }
}