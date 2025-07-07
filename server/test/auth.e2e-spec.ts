import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auth/register (POST)', () => {
        it('should register a new user and return user info (without password)', () => {
            // 使用一个随机的用户名避免和之前的测试冲突
            const username = `testuser_${Date.now()}`;
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, password: 'password123' })
                .expect(201) // 期望HTTP状态码为201 (Created)
                .expect((res) => {
                    expect(res.body).toEqual({
                        id: expect.any(Number),
                        username: username,
                    });
                });
        });

        it('should return a 409 Conflict error if username already exists', async () => {
            const username = `existinguser_${Date.now()}`;
            // 先成功注册一个用户
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, password: 'password123' })
                .expect(201);

            // 再次使用相同的用户名注册
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, password: 'password123' })
                .expect(409); // 期望HTTP状态码为409 (Conflict)
        });

        it('should return a 400 Bad Request error for invalid data', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({ username: 'test' }) // 缺少 password 字段
                .expect(400); // 期望HTTP状态码为400 (Bad Request)
        });
    });

    describe('/auth/login (POST)', () => {
        const username = `loginuser_${Date.now()}`;
        const password = 'password123';

        beforeAll(async () => {
            // 在登录测试前，先确保用户已注册
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ username, password });
        });

        it('should log in the user and return an access token', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ username, password })
                .expect(200) // 期望HTTP状态码为200 (OK)
                .expect((res) => {
                    expect(res.body).toHaveProperty('accessToken');
                    expect(res.body.accessToken).toEqual(expect.any(String));
                });
        });

        it('should return a 401 Unauthorized error for wrong password', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ username, password: 'wrongpassword' })
                .expect(401); // 期望HTTP状态码为401 (Unauthorized)
        });
    });
});