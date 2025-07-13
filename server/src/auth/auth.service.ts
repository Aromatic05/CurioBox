import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlocklistedToken } from './entities/blocklisted-token.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
    async getUserById(id: number) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
    // 注入User的Repository
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
        @InjectRepository(BlocklistedToken)
        private blocklistedTokenRepository: Repository<BlocklistedToken>,
    ) { }

    async signUp(createUserDto: any): Promise<Omit<User, 'password'>> {
        const { username, password, role } = createUserDto;

        const userExists = await this.usersRepository.findOne({ where: { username } });
        if (userExists) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = this.usersRepository.create({
            username,
            password: hashedPassword,
            role: role || 'user',
        });

        await this.usersRepository.save(newUser);
        const { password: _, ...result } = newUser;
        return result;
    }

    async signIn(loginDto: any) {
        const { username, password } = loginDto;

        // 查询用户时，需要显式地请求password字段
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.username = :username', { username })
            .getOne();

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const payload = { sub: user.id, username: user.username, role: user.role, jti: randomUUID() };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            message: 'Login successful',
            accessToken: accessToken,
        };
    }

    async changePassword(userId: number, changePasswordDto: any) {
        const { oldPassword, newPassword } = changePasswordDto;
        
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(newPassword, salt);
        
        await this.usersRepository.save(user); // 保存更新

        return { message: 'Password changed successfully' };
    }

    async logout(token: string) {
        await this.blocklistedTokenRepository.save({ token });
        return { message: 'Logged out successfully' };
    }

    async setNickname(userId: number, nickname: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        user.nickname = nickname;
        await this.usersRepository.save(user);
        return { message: 'Nickname updated successfully' };
    }

    async setAvatar(userId: number, avatar: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        user.avatar = avatar;
        await this.usersRepository.save(user);
        return { message: 'Avatar updated successfully' };
    }

    async deleteUser(userId: number, role: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        // 只有本人或管理员可以删除
        if (role !== 'admin' && user.id !== userId) {
            throw new UnauthorizedException('No permission to delete this user');
        }
        await this.usersRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
}