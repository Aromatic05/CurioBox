import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// 模拟bcrypt库
jest.mock('bcrypt', () => ({
    genSalt: jest.fn().mockResolvedValue('somesalt'),
    hash: jest.fn().mockResolvedValue('hashedpassword'),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;

    // 模拟JwtService
    const mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
    };

    beforeEach(async () => {
        // 创建一个测试模块，只提供我们需要测试的Service和它依赖的模拟对象
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);

        // 清理模拟的用户数据库，确保测试隔离
        // 注意：这是一个变通方法，因为我们用了全局内存数组。在真实应用中，你会模拟数据库仓库(repository)。
        require('./auth.service')['users'].length = 0;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signUp', () => {
        it('should successfully sign up a user', async () => {
            const createUserDto = { username: 'testuser', password: 'password123' };
            const result = await service.signUp(createUserDto);

            expect(result.username).toEqual(createUserDto.username);
            expect(result).not.toHaveProperty('password');
            expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'somesalt');
        });

        it('should throw a ConflictException if username exists', async () => {
            const createUserDto = { username: 'testuser', password: 'password123' };
            await service.signUp(createUserDto); // 先注册一个用户

            // 再次使用相同用户名注册时，应该会抛出异常
            await expect(service.signUp(createUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('signIn', () => {
        const loginDto = { username: 'testuser', password: 'password123' };

        beforeEach(async () => {
            // 每次登录测试前，先注册一个用户
            await service.signUp({ username: loginDto.username, password: loginDto.password });
        });

        it('should return an access token for valid credentials', async () => {
            // 模拟密码比对成功
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            const result = await service.signIn(loginDto);
            expect(result).toEqual({
                message: 'Login successful',
                accessToken: 'mocked_jwt_token'
            });
            expect(jwtService.signAsync).toHaveBeenCalled();
        });

        it('should throw an UnauthorizedException for invalid password', async () => {
            // 模拟密码比对失败
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            await expect(service.signIn(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw an UnauthorizedException for non-existent user', async () => {
            await expect(service.signIn({ username: 'nouser', password: 'nopassword' })).rejects.toThrow(UnauthorizedException);
        });
    });
});