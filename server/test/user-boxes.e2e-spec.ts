import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

describe('UserBoxes (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    let userToken: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        authService = moduleFixture.get<AuthService>(AuthService);
        await app.init();

        // 创建测试用户并获取token
        await authService.signUp({ username: 'test', password: 'test' });
        const { accessToken } = await authService.signIn({ username: 'test', password: 'test' });
        userToken = accessToken;
    });

    it('应该能够购买盲盒', () => {
        return request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId: 1,
                quantity: 2
            })
            .expect(201)
            .expect(res => {
                expect(res.body.message).toBe('购买成功');
                expect(res.body.order).toBeDefined();
                expect(Array.isArray(res.body.userBoxes)).toBeTruthy();
                expect(res.body.userBoxes).toHaveLength(2);
                expect(res.body.userBoxes[0].status).toBe('unopened');
            });
    });

    it('应该能查看未开启的盲盒列表', () => {
        return request(app.getHttpServer())
            .get('/me/boxes')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200)
            .expect(res => {
                expect(Array.isArray(res.body.boxes)).toBeTruthy();
                res.body.boxes.forEach(box => {
                    expect(box.status).toBe('unopened');
                    expect(box.curioBox).toBeDefined();
                });
            });
    });

    it('应该能开启盲盒', () => {
        return request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxId: 1
            })
            .expect(200)
            .expect(res => {
                expect(res.body.results).toBeDefined();
                expect(res.body.results[0].success).toBeTruthy();
                expect(res.body.results[0].drawnItem).toBeDefined();
            });
    });

    it('应该能批量开启盲盒', () => {
        return request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxIds: [1, 2]
            })
            .expect(200)
            .expect(res => {
                expect(res.body.results).toBeDefined();
                expect(res.body.results).toHaveLength(2);
                expect(res.body.totalOpened).toBe(2);
                res.body.results.forEach(result => {
                    expect(result.success).toBeTruthy();
                    expect(result.drawnItem).toBeDefined();
                });
            });
    });

    afterEach(async () => {
        await app.close();
    });
});