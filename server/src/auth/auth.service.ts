import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlocklistedToken } from './entities/blocklisted-token.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
    // 注入User的Repository
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
        @InjectRepository(BlocklistedToken)
        private blocklistedTokenRepository: Repository<BlocklistedToken>,
    ) { }

    async signUp(createUserDto: { username: string; password: string; role?: string }): Promise<Omit<User, 'password'>> {
        const { username, password, role } = createUserDto;

        const userExists = await this.usersRepository.findOne({
            where: { username },
        });
        if (userExists) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = this.usersRepository.create({
            username,
            password: hashedPassword,
            role: role || 'user',
            status: 'active',
        });

        await this.usersRepository.save(newUser);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...result } = newUser;
        return result;
    }

    async signIn(loginDto: { username: string; password: string }) {
        const { username, password } = loginDto;
        // 查询用户时，需要显式地请求password字段和refreshToken字段
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .addSelect('user.refreshToken')
            .where('user.username = :username', { username })
            .getOne();

        if (!user || typeof user.password !== 'string') {
            throw new UnauthorizedException('Invalid credentials');
        }
        // 先校验用户状态
        if (user.status !== 'active') {
            throw new UnauthorizedException('User is banned or deleted');
        }
        // 再校验密码
        const isPasswordMatch = await bcrypt.compare(String(password), user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            jti: randomUUID(),
        };
        const accessToken = await this.jwtService.signAsync(payload);
        // 生成 refreshToken（可用 uuid 或 JWT，简单用 uuid）
        const refreshToken = uuidv4();
        user.refreshToken = refreshToken;
        await this.usersRepository.save(user);
        return {
            message: 'Login successful',
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken: string) {
        // 查找用户
        const user = await this.usersRepository.findOne({ where: { refreshToken } });
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        if (user.status !== 'active') {
            throw new UnauthorizedException('User is banned or deleted');
        }
        // 生成新的 accessToken
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            jti: randomUUID(),
        };
        const accessToken = await this.jwtService.signAsync(payload);
        // 可选：生成新的 refreshToken（更安全，防止重放攻击）
        const newRefreshToken = uuidv4();
        user.refreshToken = newRefreshToken;
        await this.usersRepository.save(user);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    async changePassword(userId: number, changePasswordDto: { oldPassword: string; newPassword: string }) {
        const { oldPassword, newPassword } = changePasswordDto;

        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user || typeof user.password !== 'string') {
            throw new UnauthorizedException('Invalid credentials');
        }
        // 先校验用户状态
        if (user.status !== 'active') {
            throw new UnauthorizedException('User is banned or deleted');
        }
        // 再校验密码
        const isPasswordMatch = await bcrypt.compare(
            String(oldPassword),
            user.password,
        );
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(String(newPassword), salt);
        await this.usersRepository.save(user); // 保存更新
        return { message: 'Password changed successfully' };
    }

    async logout(token: string) {
        await this.blocklistedTokenRepository.save({ token });
        return { message: 'Logged out successfully' };
    }

    async setNickname(userId: number, nickname: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        user.nickname = nickname;
        await this.usersRepository.save(user);
        return { message: 'Nickname updated successfully' };
    }

    async setAvatar(userId: number, avatar: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        user.avatar = avatar;
        await this.usersRepository.save(user);
        return { message: 'Avatar updated successfully' };
    }

    async setUserStatus(userId: number, role: string, status: 'active' | 'banned' | 'deleted') {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');
        if (role !== 'admin' && user.id !== userId) {
            throw new UnauthorizedException('No permission to change this user');
        }
        user.status = status;
        await this.usersRepository.save(user);
        return { message: `User status set to ${status}` };
    }
}
