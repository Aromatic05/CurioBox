import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

describe('UserBoxes (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    let userToken: string;
    let adminToken: string;
    let testUsername: string;
    let curioBoxId: number;
    let userBoxId: number;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        authService = moduleFixture.get<AuthService>(AuthService);
        await app.init();

        // 创建唯一测试用户和管理员并获取token
        testUsername = 'test_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        const adminName = 'admin_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        await authService.signUp({ username: adminName, password: 'admin', role: 'admin' });
        adminToken = (await authService.signIn({ username: adminName, password: 'admin' })).accessToken;
        await authService.signUp({ username: testUsername, password: 'test' });
        userToken = (await authService.signIn({ username: testUsername, password: 'test' })).accessToken;

        // 用管理员 token 创建盲盒
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

        // 用管理员 token 给盲盒添加物品
        const itemIds: number[] = [];
        for (let i = 1; i <= 3; i++) {
            const itemRes = await request(app.getHttpServer())
                .post('/items')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: `Item ${i}`,
                    image: `http://example.com/item${i}.png`,
                    category: 'test',
                    stock: 100,
                    rarity: 'common',
                    curioBoxIds: [curioBoxId] // 关键：用 curioBoxIds 数组
                });
            itemIds.push(itemRes.body.id);
        }
        // PATCH 盲盒，设置 itemProbabilities
        const probability = 1 / itemIds.length;
        await request(app.getHttpServer())
            .patch(`/curio-boxes/${curioBoxId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                itemProbabilities: itemIds.map(id => ({ itemId: id, probability }))
            });
    });

    it('应该能够购买盲盒', async () => {
        const res = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 2
            })
            .expect(201);
        expect(res.body.message).toBe('购买成功');
        expect(res.body.order).toBeDefined();
        expect(Array.isArray(res.body.userBoxes)).toBeTruthy();
        expect(res.body.userBoxes).toHaveLength(2);
        expect(res.body.userBoxes[0].status).toBe('unopened');
        userBoxId = res.body.userBoxes[0].id;
    });

    it('应该能查看未开启的盲盒列表', async () => {
        // 先购买盲盒
        await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 1 })
            .expect(201);
        // 查询未开启盲盒
        const res = await request(app.getHttpServer())
            .get('/user-boxes')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        res.body.forEach(box => {
            expect(box.status).toBe('unopened');
            expect(box.curioBox).toBeDefined();
        });
        userBoxId = res.body[0].id;
    });

    it('应该能开启盲盒', async () => {
        // 先购买盲盒
        const purchaseRes = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 1 })
            .expect(201);
        userBoxId = purchaseRes.body.userBoxes[0].id;
        // 开盲盒
        const res = await request(app.getHttpServer())
            .post('/user-boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxId })
            .expect(200);
        expect(res.body.results).toBeDefined();
        expect(res.body.results[0].success).toBeTruthy();
        expect(res.body.results[0].drawnItem).toBeDefined();
    });

    it('应该能批量开启盲盒', async () => {
        // 先购买盲盒
        const purchaseRes = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 2 })
            .expect(201);
        const userBoxIds = purchaseRes.body.userBoxes.map(box => box.id);
        // 批量开盲盒
        const res = await request(app.getHttpServer())
            .post('/user-boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxIds })
            .expect(200);
        expect(res.body.results).toBeDefined();
        expect(res.body.results).toHaveLength(2);
        expect(res.body.totalOpened).toBe(2);
        res.body.results.forEach(result => {
            expect(result.success).toBeTruthy();
            expect(result.drawnItem).toBeDefined();
        });
    });

    afterEach(async () => {
        await app.close();
    });
});