import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

// --- 模拟数据库 ---
const users: User[] = [];

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async signUp(createUserDto: any): Promise<Omit<User, 'password'>> { // 返回类型也可以更精确
        const { username, password } = createUserDto;

        const userExists = users.find((user) => user.username === username);
        if (userExists) {
            throw new ConflictException('Username already exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser: User = { id: users.length + 1, username, password: hashedPassword };
        users.push(newUser);

        const { password: _, ...result } = newUser;
        return result;
    }

    /**
     * 用户登录
     * @param loginDto 包含用户名和密码的对象
     */
    async signIn(loginDto: any) {
        const { username, password } = loginDto;

        // 查找用户
        const user = users.find((user) => user.username === username);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 验证密码
        if (!user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 生成JWT
        const payload = { sub: user.id, username: user.username };
        const accessToken = await this.jwtService.signAsync(payload);

        return {
            message: 'Login successful',
            accessToken: accessToken,
        };
    }
}