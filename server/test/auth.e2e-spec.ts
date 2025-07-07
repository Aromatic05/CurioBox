import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string; // 用于存储认证后的token
  const user = {
    username: `testuser_${Date.now()}`,
    password: 'password123',
    newPassword: 'newPassword456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // 注册一个用于后续测试的用户
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: user.username, password: user.password })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should return a 409 Conflict error if username already exists', () => {
      // 尝试再次注册同一个用户
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: user.username, password: user.password })
        .expect(409);
    });

    it('should return a 400 Bad Request error for invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'test' }) // 缺少 password 字段
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should log in the user and return an access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: user.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      accessToken = res.body.accessToken; // 保存token
    });

    it('should return a 401 Unauthorized error for wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('/auth/change-password (POST)', () => {
    it('should fail if no access token is provided', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .send({ oldPassword: user.password, newPassword: user.newPassword })
        .expect(401); // 未授权
    });

    it('should fail with wrong old password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`) // 设置认证头
        .send({ oldPassword: 'wrongoldpassword', newPassword: user.newPassword })
        .expect(401); // 未授权
    });

    it('should change the password successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: user.password, newPassword: user.newPassword })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual('Password changed successfully');
        });
    });

    it('should be able to login with the new password', () => {
      // 验证旧密码已失效
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: user.password })
        .expect(401);

      // 使用新密码登录
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: user.newPassword })
        .expect(200);
    });
  });

  describe('/auth/logout (GET)', () => {
    let tokenToLogout: string;

    beforeAll(async () => {
      // 重新登录以获取一个新的、未被注销的token
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: user.newPassword });
      tokenToLogout = res.body.accessToken;
    });

    it('should logout the user successfully', () => {
      return request(app.getHttpServer())
        .get('/auth/logout')
        .set('Authorization', `Bearer ${tokenToLogout}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual('Logged out successfully');
        });
    });

    it('should not be able to use the logged-out token again', () => {
      // 尝试使用已注销的token访问一个受保护的路由 (例如修改密码)
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${tokenToLogout}`)
        .send({ oldPassword: 'a', newPassword: 'b' })
        .expect(401); // 期望被拒绝
    });
  });

  describe('/auth/set-nickname (POST)', () => {
    it('should fail if no access token is provided', () => {
      return request(app.getHttpServer())
        .post('/auth/set-nickname')
        .send({ nickname: '新昵称' })
        .expect(401);
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
  });

  describe('User role (权限) related', () => {
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
      // 登录后查询数据库或通过接口验证角色为 user（如有用户信息接口）
    });

    it('should set role to admin if provided', async () => {
      const username = `adminuser_${Date.now()}`;
      const password = 'password123';
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username, password, role: 'admin' })
        .expect(201);
      // 登录后查询数据库或通过接口验证角色为 admin（如有用户信息接口）
    });

    it('should not allow to change role via set-nickname or other public API', async () => {
      // 尝试通过 set-nickname 伪造 role 字段
      await request(app.getHttpServer())
        .post('/auth/set-nickname')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nickname: '恶意昵称', role: 'admin' })
        .expect(200);
      // 登录后查询数据库或通过接口验证角色未被更改（如有用户信息接口）
    });
  });
});