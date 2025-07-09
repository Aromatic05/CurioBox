import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

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
        role: "admin",
    };

    const regularUser = {
        username: `user_${Date.now()}`,
        password: 'userpassword',
        role: "user",
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        
        // 注册管理员和普通用户
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(adminUser)
            .expect(201);
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(regularUser)
            .expect(201);

        // 管理员登录获取Token
        const adminLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: adminUser.username, password: adminUser.password });
        adminToken = adminLoginRes.body.accessToken;

        // 创建测试用的盲盒和物品
        const curioBoxRes = await request(app.getHttpServer())
            .post('/curio-boxes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Box',
                description: 'A box for testing',
                price: 9.99,
                coverImage: 'http://example.com/image.png',
                category: 'test'
            });
        curioBoxId = curioBoxRes.body.id;

        // 添加测试物品
        for (let i = 1; i <= 3; i++) {
            await request(app.getHttpServer())
                .post('/items')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: `Item ${i}`,
                    image: `http://example.com/item${i}.png`,
                    category: 'test',
                    stock: 100,
                    rarity: 'common',
                });
        }

        // 普通用户登录获取Token
        const userLoginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: regularUser.username, password: regularUser.password });
        userToken = userLoginRes.body.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /orders/purchase', () => {
        it('should fail if not authenticated', () => {
            return request(app.getHttpServer())
                .post('/orders/purchase')
                .send({ curioBoxId })
                .expect(401);
        });

        it('should create an order and userBoxes when purchasing', async () => {
            const res = await request(app.getHttpServer())
                .post('/orders/purchase')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ 
                    curioBoxId,
                    quantity: 2 
                })
                .expect(201);

            expect(res.body).toHaveProperty('message', '购买成功');
            expect(res.body.order).toHaveProperty('id');
            expect(res.body.order.price).toBeCloseTo(19.98, 2); // 修正断言为数字
            expect(Array.isArray(res.body.userBoxes)).toBeTruthy();
            expect(res.body.userBoxes).toHaveLength(2);
            expect(res.body.userBoxes[0].status).toBe('unopened');

            createdOrderId = res.body.order.id;
        });

        it('should return 404 if curioBoxId does not exist', () => {
            return request(app.getHttpServer())
                .post('/orders/purchase')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ curioBoxId: 9999 })
                .expect(404);
        });
    });

    describe('GET /orders', () => {
        it('should fail if not authenticated', () => {
            return request(app.getHttpServer())
                .get('/orders')
                .expect(401);
        });

        it('should return a list of orders for the current user', async () => {
            const res = await request(app.getHttpServer())
                .get('/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.map(o => o.id)).toContain(createdOrderId); // 更健壮的断言
        });
    });

    describe('GET /orders/:id', () => {
        it('should fail if not authenticated', () => {
            return request(app.getHttpServer())
                .get(`/orders/${createdOrderId}`)
                .expect(401);
        });

        it('should return a single order by id', async () => {
            const res = await request(app.getHttpServer())
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.id).toBe(createdOrderId);
            expect(res.body.curioBox).toBeDefined();
        });

        it('should return 404 when trying to access another user\'s order', () => {
            return request(app.getHttpServer())
                .get(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });
});