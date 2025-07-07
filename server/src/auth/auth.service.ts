import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// const users: User[] = [];
export const blocklistedTokens = new Set<string>();

@Injectable()
export class AuthService {
    // 注入User的Repository
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async signUp(createUserDto: any): Promise<Omit<User, 'password'>> {
        const { username, password } = createUserDto;

        const userExists = await this.usersRepository.findOne({ where: { username } });
        if (userExists) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 创建一个新的用户实例
        const newUser = this.usersRepository.create({
            username,
            password: hashedPassword,
        });

        // 保存到数据库
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
        
        const payload = { sub: user.id, username: user.username };
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
        blocklistedTokens.add(token);
        return { message: 'Logged out successfully (client should delete token)' };
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
}