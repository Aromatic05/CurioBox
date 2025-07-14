import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserItem } from './entities/user-item.entity';

@Injectable()
export class UserItemsService {
    constructor(
        @InjectRepository(UserItem)
        private readonly userItemRepo: Repository<UserItem>,
    ) {}

    async findAllByUser(userId: number) {
        return this.userItemRepo.find({ where: { userId } });
    }

    async removeItem(userId: number, itemId: number, count: number) {
        const userItem = await this.userItemRepo.findOne({ where: { userId, itemId } });
        if (!userItem) return { success: false, message: 'Item not found' };
        if (userItem.count <= count) {
            await this.userItemRepo.delete(userItem.id);
            return { success: true, deleted: true };
        } else {
            userItem.count -= count;
            await this.userItemRepo.save(userItem);
            return { success: true, deleted: false, count: userItem.count };
        }
    }
    // 用于开盲盒时添加 item
    async addItem(userId: number, itemId: number, count: number = 1) {
        let userItem = await this.userItemRepo.findOne({ where: { userId, itemId } });
        if (userItem) {
            userItem.count += count;
            await this.userItemRepo.save(userItem);
        } else {
            userItem = this.userItemRepo.create({ userId, itemId, count });
            await this.userItemRepo.save(userItem);
        }
        return userItem;
    }
}
