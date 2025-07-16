import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as http from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

// 响应体类型定义
interface CurioBoxResponse { id: number; }
interface ItemResponse { id: number; }
interface PurchaseResponse {
    message: string;
    order: { id: number; price: number };
    userBoxes: Array<{ status: string }>;
}
interface OrderResponse {
    id: number;
    curioBox: unknown;
}

describe('OrdersController (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    let adminToken: string;
    let userToken: string;
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
        const curioBoxRes = await request(app.getHttpServer() as http.Server)
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
        curioBoxId = (curioBoxRes.body as CurioBoxResponse).id;

        // 添加测试物品到盲盒
        const itemRes = await request(app.getHttpServer() as http.Server)
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
        await request(app.getHttpServer() as http.Server)
            .patch(`/curio-boxes/${curioBoxId}/items-and-probabilities`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                itemIds: [(itemRes.body as ItemResponse).id],
                itemProbabilities: [
                    { itemId: (itemRes.body as ItemResponse).id, probability: 1.0 },
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
            return request(app.getHttpServer() as http.Server)
                .post('/orders/purchase')
                .send({ curioBoxId })
                .expect(401);
        });

        it('购买盲盒应该成功', async () => {
            const res = await request(app.getHttpServer() as http.Server)
                .post('/orders/purchase')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    curioBoxId,
                    quantity: 2,
                })
                .expect(201);

            const body = res.body as PurchaseResponse;
            expect(body).toHaveProperty('message', '购买成功');
            expect(body.order).toBeDefined();
            expect(Number(body.order.price)).toBeCloseTo(19.98);
            expect(Array.isArray(body.userBoxes)).toBeTruthy();
            expect(body.userBoxes).toHaveLength(2);
            expect(body.userBoxes[0].status).toBe('unopened');

            createdOrderId = body.order.id;
        });

        it('盲盒不存在时应该返回404', () => {
            return request(app.getHttpServer() as http.Server)
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
            const res = await request(app.getHttpServer() as http.Server)
                .get('/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            const orders = res.body as Array<{ id: number }>;
            expect(Array.isArray(orders)).toBeTruthy();
            expect(orders.length).toBeGreaterThan(0);
            const orderIds = orders.map((o) => o.id);
            expect(orderIds).toContain(createdOrderId);
        });
    });

    describe('GET /orders/:id', () => {
        it('未认证时应该失败', () => {
            return request(app.getHttpServer() as http.Server)
                .get(`/orders/${createdOrderId}`)
                .expect(401);
        });

        it('应该返回单个订单详情', async () => {
            const res = await request(app.getHttpServer() as http.Server)
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            const order = res.body as OrderResponse;
            expect(order.id).toBe(createdOrderId);
            expect(order.curioBox).toBeDefined();
        });

        it('访问其他用户订单时应该返回404', () => {
            return request(app.getHttpServer() as http.Server)
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });
});
