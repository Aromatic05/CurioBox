import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findActiveById(id: number): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id, status: 'active' } });
        return user;
    }

    async findPublicById(id: number): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('用户不存在');
        // 只返回公开字段
        const { password, ...publicInfo } = user;
        return publicInfo;
    }

    async findAllPublic(): Promise<Partial<User>[]> {
        const users = await this.userRepository.find();
        // 只返回公开字段
        return users.map(({ password, ...publicInfo }) => publicInfo);
    }
}
