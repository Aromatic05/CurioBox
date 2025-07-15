import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string; // 用于存储认证后的token
    let adminToken: string; // 用于存储管理员的token
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

        // 注册一个管理员和一个普通用户
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send({ username: user.username, password: user.password })
            .expect(201);
        userId = res.body.id;

        const adminRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send({ username: admin.username, password: admin.password, role: 'admin' })
            .expect(201);
        adminId = adminRes.body.id;

        // 登录管理员获取token
        const adminLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: admin.username, password: admin.password })
            .expect(200);
        adminToken = adminLoginRes.body.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Auth flow', () => {
        it('should register a user', () => {
            expect(userId).toBeDefined();
        });

        it('should log in the user and return an access token', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: user.username, password: user.password })
                .expect(200);

            expect(res.body).toHaveProperty('accessToken');
            accessToken = res.body.accessToken; // 保存token
        });

        it('should fail to login with wrong password', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: user.username, password: 'wrongpassword' })
                .expect(401);
        });

        it('should change the password successfully', async () => {
            await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    oldPassword: user.password,
                    newPassword: user.newPassword,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toEqual(
                        'Password changed successfully',
                    );
                });
            // 更新用户密码，以便后续测试使用新密码登录
            user.password = user.newPassword;
        });

        it('should be able to login with the new password', async () => {
            // 验证旧密码已失效
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword + 'wrong' })
                .expect(401);

            // 使用新密码登录
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword })
                .expect(200);
            accessToken = res.body.accessToken; // 更新token
        });

        it('should logout the user successfully and invalidate token', async () => {
            const tokenToLogout = accessToken; // 使用当前有效的token

            await request(app.getHttpServer())
                .get('/auth/logout')
                .set('Authorization', `Bearer ${tokenToLogout}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toEqual('Logged out successfully');
                });

            // 尝试使用已注销的token访问一个受保护的路由 (例如修改密码)
            await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${tokenToLogout}`)
                .send({ oldPassword: 'a', newPassword: 'b' })
                .expect(401); // 期望被拒绝
        });

        it('should refresh token successfully', async () => {
            // 重新登录获取新的accessToken和refreshToken
            const loginRes = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword })
                .expect(200);
            const oldRefreshToken = loginRes.body.refreshToken;
            accessToken = loginRes.body.accessToken; // 更新accessToken

            // 使用refreshToken获取新的accessToken
            const refreshRes = await request(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken: oldRefreshToken })
                .expect(200);

            expect(refreshRes.body).toHaveProperty('accessToken');
            expect(refreshRes.body).toHaveProperty('refreshToken');

            // 验证旧的refreshToken已失效
            await request(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken: oldRefreshToken })
                .expect(401); // 期望旧的refreshToken失效
        });

        it('should set nickname successfully when logged in', async () => {
            const nickname = '测试昵称';
            const res = await request(app.getHttpServer())
                .post('/auth/set-nickname')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ nickname })
                .expect(200);
            expect(res.body.message).toEqual('Nickname updated successfully');
        });

        it('should update nickname in database', async () => {
            const nickname = '数据库昵称';
            await request(app.getHttpServer())
                .post('/auth/set-nickname')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ nickname })
                .expect(200);
            // 再次登录，获取用户信息，验证昵称已更新
            // 这里假设有获取用户信息的接口，若无可跳过此步
        });

        it('should set role to user by default when not provided', async () => {
            const username = `roleuser_${Date.now()}`;
            const password = 'password123';
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, password })
                .expect(201)
                .expect((res) => {
                    expect(res.body.role).toBe('user');
                });
        });

        it('should set role to admin if provided', async () => {
            const username = `adminuser_${Date.now()}`;
            const password = 'password123';
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, password, role: 'admin' })
                .expect(201);
        });

        it('should not allow to change role via set-nickname or other public API', async () => {
            // 尝试通过 set-nickname 伪造 role 字段
            await request(app.getHttpServer())
                .post('/auth/set-nickname')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ nickname: '恶意昵称', role: 'admin' })
                .expect(200);
            // 再次登录，验证角色未被更改
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: user.username, password: user.newPassword })
                .expect(200);
            expect(res.body.role).not.toBe('admin');
        });
    });

    describe('User Status Tests', () => {
        let testUserForStatus: any;
        let testUserIdForStatus: number;
        let testUserTokenForStatus: string;

        beforeEach(async () => {
            // 注册一个新用户用于每个状态测试，确保测试隔离
            testUserForStatus = {
                username: `statususer_${Date.now()}`,
                password: 'password123',
            };
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(201);
            testUserIdForStatus = res.body.id;

            const loginRes = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(200);
            testUserTokenForStatus = loginRes.body.accessToken;
        });

        it('should not allow banned user to login', async () => {
            await request(app.getHttpServer())
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(401);
        });

        it('should not allow banned user to change password', async () => {
            await request(app.getHttpServer())
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${testUserTokenForStatus}`)
                .send({ oldPassword: testUserForStatus.password, newPassword: 'x' })
                .expect(401);
        });

        it('should not allow deleted user to login', async () => {
            await request(app.getHttpServer())
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: testUserForStatus.username, password: testUserForStatus.password })
                .expect(401);
        });

        it('should not allow deleted user to change password', async () => {
            await request(app.getHttpServer())
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: testUserIdForStatus })
                .expect(200);

            await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${testUserTokenForStatus}`)
                .send({ oldPassword: testUserForStatus.password, newPassword: 'x' })
                .expect(401);
        });
    });

    describe('Role-based Access Control Tests', () => {
        let normalUserToken: string;
        let normalUserId: number;

        beforeAll(async () => {
            const normalUser = {
                username: `normaluser_${Date.now()}`,
                password: 'password123',
            };
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username: normalUser.username, password: normalUser.password })
                .expect(201);
            normalUserId = res.body.id;

            const loginRes = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: normalUser.username, password: normalUser.password })
                .expect(200);
            normalUserToken = loginRes.body.accessToken;
        });

        it('should not allow normal user to ban/unban/delete other users', async () => {
            // 尝试用普通用户token封禁用户
            await request(app.getHttpServer())
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ userId: adminId })
                .expect(403); // 期望无权限

            // 尝试用普通用户token解封用户
            await request(app.getHttpServer())
                .post('/auth/unban-user')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ userId: adminId })
                .expect(403); // 期望无权限

            // 尝试用普通用户token删除其他用户
            await request(app.getHttpServer())
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ userId: adminId }) // 尝试删除管理员
                .expect(403); // 期望无权限
        });

        it('should allow admin to ban/unban/delete users', async () => {
            // 注册一个临时用户供管理员操作
            const tempUser = {
                username: `tempuser_${Date.now()}`,
                password: 'password123',
            };
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(201);
            const tempUserId = res.body.id;

            // 管理员封禁用户
            await request(app.getHttpServer())
                .post('/auth/ban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: tempUserId })
                .expect(200);

            // 验证用户被封禁后无法登录
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(401);

            // 管理员解封用户
            await request(app.getHttpServer())
                .post('/auth/unban-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: tempUserId })
                .expect(200);

            // 验证用户解封后可以登录
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(200);

            // 管理员删除用户
            await request(app.getHttpServer())
                .post('/auth/delete-user')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ userId: tempUserId })
                .expect(200);

            // 验证用户删除后无法登录
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: tempUser.username, password: tempUser.password })
                .expect(401);
        });
    });
});
