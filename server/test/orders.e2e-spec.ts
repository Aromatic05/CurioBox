import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

describe('OrdersController (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    let adminToken: string;
    let userToken: string; // 定义 userToken
    let curioBoxId: number;
    let createdOrderId: number;

    const adminUser = {
        username: `admin_${Date.now()}`,
        password: 'adminpassword',
        role: 'admin',
    };

    const regularUser = {
        username: `user_${Date.now()}`,
        password: 'userpassword',
        role: 'user',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        authService = moduleFixture.get<AuthService>(AuthService);
        await app.init();

        // 注册管理员和普通用户
        await authService.signUp(adminUser);
        await authService.signUp(regularUser);

        // 管理员登录获取Token
        const adminLoginRes = await authService.signIn({
            username: adminUser.username,
            password: adminUser.password,
        });
        adminToken = adminLoginRes.accessToken;

        // 创建测试盲盒和物品
        const curioBoxRes = await request(app.getHttpServer())
            .post('/curio-boxes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Box',
                description: 'A box for testing',
                price: 9.99,
                boxCount: 10,
                category: 'test',
                itemIds: [],
                itemProbabilities: [],
            });
        curioBoxId = curioBoxRes.body.id;

        // 添加测试物品到盲盒
        const itemRes = await request(app.getHttpServer())
            .post('/items')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Item',
                image: 'http://example.com/item.png',
                category: 'test',
                stock: 100,
                rarity: 'common',
            });

        // 设置盲盒物品和概率
        await request(app.getHttpServer())
            .patch(`/curio-boxes/${curioBoxId}/items-and-probabilities`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                itemIds: [itemRes.body.id],
                itemProbabilities: [
                    { itemId: itemRes.body.id, probability: 1.0 },
                ],
            });

        // 普通用户登录获取Token
        const userLoginRes = await authService.signIn({
            username: regularUser.username,
            password: regularUser.password,
        });
        userToken = userLoginRes.accessToken; // 这里获取 userToken
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /orders/purchase', () => {
        it('未认证时应该失败', () => {
            return request(app.getHttpServer())
                .post('/orders/purchase')
                .send({ curioBoxId })
                .expect(401);
        });

        it('购买盲盒应该成功', async () => {
            const res = await request(app.getHttpServer())
                .post('/orders/purchase')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    curioBoxId,
                    quantity: 2,
                })
                .expect(201);

            expect(res.body).toHaveProperty('message', '购买成功');
            expect(res.body.order).toBeDefined();
            expect(Number(res.body.order.price)).toBeCloseTo(19.98); // 修正断言
            expect(Array.isArray(res.body.userBoxes)).toBeTruthy();
            expect(res.body.userBoxes).toHaveLength(2);
            expect(res.body.userBoxes[0].status).toBe('unopened');

            createdOrderId = res.body.order.id;
        });

        it('盲盒不存在时应该返回404', () => {
            return request(app.getHttpServer())
                .post('/orders/purchase')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ curioBoxId: 9999 })
                .expect(404);
        });
    });

    describe('GET /orders', () => {
        it('未认证时应该失败', () => {
            return request(app.getHttpServer()).get('/orders').expect(401);
        });

        it('应该返回用户订单列表', async () => {
            const res = await request(app.getHttpServer())
                .get('/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            const orderIds = res.body.map((o) => o.id);
            expect(orderIds).toContain(createdOrderId); // 更健壮
        });
    });

    describe('GET /orders/:id', () => {
        it('未认证时应该失败', () => {
            return request(app.getHttpServer())
                .get(`/orders/${createdOrderId}`)
                .expect(401);
        });

        it('应该返回单个订单详情', async () => {
            const res = await request(app.getHttpServer())
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.id).toBe(createdOrderId);
            expect(res.body.curioBox).toBeDefined();
        });

        it('访问其他用户订单时应该返回404', () => {
            return request(app.getHttpServer())
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });
});
