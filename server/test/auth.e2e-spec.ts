import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as http from 'http'; // FIX 1: 导入 Node.js 的 http 模块
import { AppModule } from '../src/app.module';

// --- FIX 1: 定义 API 响应的接口 ---
// 这将为我们的测试提供类型安全，并消除所有 `any` 相关的错误。

// 注册成功后的响应体
interface RegisterResponse {
    id: number;
    username: string;
    role: 'user' | 'admin';
}

// 登录成功后的响应体
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    role: 'user' | 'admin';
}

// 刷新 Token 的响应体
interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

// 通用成功消息的响应体
interface MessageResponse {
    message: string;
}

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let httpServer: http.Server; // FIX 2: 声明类型安全的 http 服务器变量
    let accessToken: string;
    let adminToken: string;
    let userId: number;
    let adminId: number;
    const user = {
        username: `testuser_${Date.now()}`,
        password: 'password123',
        newPassword: 'newPassword456',
    };
    const admin = {
        username: `testadmin_${Date.now()}`,
        password: 'password123',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        // FIX 3: 获取服务器实例并使用类型断言
        httpServer = app.getHttpServer() as http.Server;

        // FIX 4: 在所有 request 调用中使用新的 httpServer 变量
        const res = await request(httpServer)
            .post('/auth/register')
            .send({ username: user.username, password: user.password })
            .expect(201);
        userId = (res.body as RegisterResponse).id;

        const adminRes = await request(httpServer)
            .post('/auth/register')
            .send({ username: admin.username, password: admin.password, role: 'admin' })
            .expect(201);
        adminId = (adminRes.body as RegisterResponse).id;

        const adminLoginRes = await request(httpServer)
            .post('/auth/login')
            .send({ username: admin.username, password: admin.password })
            .expect(200);
        adminToken = (adminLoginRes.body as LoginResponse).accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Auth flow', () => {
        it('should register a user', () => {
            expect(userId).toBeDefined();
        });

        it('should log in the user and return an access token', async () => {
            const res = await request(httpServer)
                .post('/auth/login')
                .send({ username: user.username, password: user.password })
                .expect(200);

            // FIX: 断言响应体类型
            const body = res.body as LoginResponse;
            expect(body).toHaveProperty('accessToken');
            accessToken = body.accessToken;
        });

        it('should fail to login with wrong password', () => {
            return request(httpServer)
                .post('/auth/login')
                .send({ username: user.username, password: 'wrongpassword' })
                .expect(401);
        });

        it('should change the password successfully', async () => {
            await request(httpServer)
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    oldPassword: user.password,
                    newPassword: user.newPassword,
                })
                .expect(200)
                .expect((res) => {
                    // FIX: 断言响应体类型
                    expect((res.body as MessageResponse).message).toEqual(
                        'Password changed successfully',
                    );
                });
            user.password = user.newPassword;
        });

        it('should be able to login with the new password', async () => {
            await request(httpServer)
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword + 'wrong' })
                .expect(401);

            const res = await request(httpServer)
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword })
                .expect(200);
            // FIX: 断言响应体类型
            accessToken = (res.body as LoginResponse).accessToken;
        });

        it('should logout the user successfully and invalidate token', async () => {
            const tokenToLogout = accessToken;

            await request(httpServer)
                .get('/auth/logout')
                .set('Authorization', `Bearer ${tokenToLogout}`)
                .expect(200)
                .expect((res) => {
                    // FIX: 断言响应体类型
                    expect((res.body as MessageResponse).message).toEqual('Logged out successfully');
                });

            await request(httpServer)
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${tokenToLogout}`)
                .send({ oldPassword: 'a', newPassword: 'b' })
                .expect(401);
        });

        it('should refresh token successfully', async () => {
            const loginRes = await request(httpServer)
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword })
                .expect(200);
            const loginBody = loginRes.body as LoginResponse;
            const oldRefreshToken = loginBody.refreshToken;
            accessToken = loginBody.accessToken;

            const refreshRes = await request(httpServer)
                .post('/auth/refresh')
                .send({ refreshToken: oldRefreshToken })
                .expect(200);

            // FIX: 断言响应体类型
            const refreshBody = refreshRes.body as RefreshResponse;
            expect(refreshBody).toHaveProperty('accessToken');
            expect(refreshBody).toHaveProperty('refreshToken');

            await request(httpServer)
                .post('/auth/refresh')
                .send({ refreshToken: oldRefreshToken })
                .expect(401);
        });

        it('should set nickname successfully when logged in', async () => {
            const nickname = '测试昵称';
            const res = await request(httpServer)
                .post('/auth/set-nickname')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ nickname })
                .expect(200);
            // FIX: 断言响应体类型
            expect((res.body as MessageResponse).message).toEqual('Nickname updated successfully');
        });

        it('should update nickname in database', async () => {
            const nickname = '数据库昵称';
            await request(httpServer)
                .post('/auth/set-nickname')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ nickname })
                .expect(200);
        });

        it('should set role to user by default when not provided', async () => {
            const username = `roleuser_${Date.now()}`;
            const password = 'password123';
            await request(httpServer)
                .post('/auth/register')
                .send({ username, password })
                .expect(201)
                .expect((res) => {
                    // FIX: 断言响应体类型
                    expect((res.body as RegisterResponse).role).toBe('user');
                });
        });

        it('should set role to admin if provided', async () => {
            const username = `adminuser_${Date.now()}`;
            const password = 'password123';
            const res = await request(httpServer)
                .post('/auth/register')
                .send({ username, password, role: 'admin' })
                .expect(201);
            // FIX: 断言并验证
            expect((res.body as RegisterResponse).role).toBe('admin');
        });

        it('should not allow to change role via set-nickname or other public API', async () => {
            await request(httpServer)
                .post('/auth/set-nickname')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ nickname: '恶意昵称', role: 'admin' })
                .expect(200);

            const res = await request(httpServer)
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword })
                .expect(200);
            // FIX: 断言响应体类型
            expect((res.body as LoginResponse).role).not.toBe('admin');
        });
    });

    describe('User Status Tests', () => {
        // FIX: 给 testUserForStatus 明确的类型
        let testUserForStatus: { username: string; password: string };
        let testUserIdForStatus: number;
        let testUserTokenForStatus: string;

        beforeEach(async () => {
            testUserForStatus = {
                username: `statususer_${Date.now()}`,
                password: 'password123',
            };
            const res = await request(httpServer)
                .post('/auth/register')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(201);
            testUserIdForStatus = (res.body as RegisterResponse).id;

            const loginRes = await request(httpServer)
                .post('/auth/login')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(200);
            testUserTokenForStatus = (loginRes.body as LoginResponse).accessToken;
        });

        it('should not allow banned user to login', async () => {
            await request(httpServer)
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(httpServer)
                .post('/auth/login')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(401);
        });

        it('should not allow banned user to change password', async () => {
            await request(httpServer)
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(httpServer)
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${testUserTokenForStatus}`)
                .send({ oldPassword: testUserForStatus.password, newPassword: 'x' })
                .expect(401);
        });

        it('should not allow deleted user to login', async () => {
            await request(httpServer)
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(httpServer)
                .post('/auth/login')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(401);
        });

        it('should not allow deleted user to change password', async () => {
            await request(httpServer)
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(httpServer)
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${testUserTokenForStatus}`)
                .send({ oldPassword: testUserForStatus.password, newPassword: 'x' })
                .expect(401);
        });
    });

    describe('Role-based Access Control Tests', () => {
        let normalUserToken: string;
        // FIX 3: 移除了未使用的变量 normalUserId 以解决 no-unused-vars 错误
        // let normalUserId: number;

        beforeAll(async () => {
            const normalUser = {
                username: `normaluser_${Date.now()}`,
                password: 'password123',
            };
            await request(httpServer)
                .post('/auth/register')
                .send({ username: normalUser.username, password: normalUser.password })
                .expect(201);

            const loginRes = await request(httpServer)
                .post('/auth/login')
                .send({ username: normalUser.username, password: normalUser.password })
                .expect(200);
            normalUserToken = (loginRes.body as LoginResponse).accessToken;
        });

        it('should not allow normal user to ban/unban/delete other users', async () => {
            await request(httpServer)
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ userId: adminId })
                .expect(403);

            await request(httpServer)
                .post('/auth/unban-user')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ userId: adminId })
                .expect(403);

            await request(httpServer)
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ userId: adminId })
                .expect(403);
        });

        it('should allow admin to ban/unban/delete users', async () => {
            const tempUser = {
                username: `tempuser_${Date.now()}`,
                password: 'password123',
            };
            const res = await request(httpServer)
                .post('/auth/register')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(201);
            const tempUserId = (res.body as RegisterResponse).id;

            await request(httpServer)
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: tempUserId })
                .expect(200);

            await request(httpServer)
                .post('/auth/login')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(401);

            await request(httpServer)
                .post('/auth/unban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: tempUserId })
                .expect(200);

            await request(httpServer)
                .post('/auth/login')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(200);

            await request(httpServer)
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: tempUserId })
                .expect(200);

            await request(httpServer)
                .post('/auth/login')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(401);
        });
    });
});