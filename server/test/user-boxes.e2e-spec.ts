import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { DataSource } from 'typeorm';

describe('UserBoxes (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    let userToken: string;
    let adminToken: string;
    let curioBoxId: number;
    let userBoxId: number;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        authService = moduleFixture.get<AuthService>(AuthService);
        await app.init();

        // 清空数据库，避免用户名冲突
        const dataSource = moduleFixture.get<DataSource>(DataSource);
        await dataSource.synchronize(true);

        // 创建管理员用户
        await authService.signUp({ username: 'admin', password: 'admin', role: 'admin' });
        const adminLogin = await authService.signIn({ username: 'admin', password: 'admin' });
        adminToken = adminLogin.accessToken;

        // 生成唯一测试用户名，避免重复
        const uniqueUsername = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // 创建测试用户并获取token
        await authService.signUp({ username: uniqueUsername, password: 'test' });
        const { accessToken } = await authService.signIn({ username: uniqueUsername, password: 'test' });
        userToken = accessToken;

        // 创建测试盲盒和物品
        const curioBoxRes = await request(app.getHttpServer())
            .post('/curio-boxes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Box',
                description: 'A box for testing',
                price: 9.99,
                category: 'test'
            });
        curioBoxId = curioBoxRes.body.id;

        // 创建测试物品
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

        // 更新盲盒的物品和概率
        await request(app.getHttpServer())
            .patch(`/curio-boxes/${curioBoxId}/items-and-probabilities`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                itemIds: [itemRes.body.id],
                itemProbabilities: [
                    { itemId: itemRes.body.id, probability: 1.0 }
                ]
            });
    });

    it('应该能够购买盲盒（购买时确定内容）', async () => {
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
        const res = await request(app.getHttpServer())
            .get('/me/boxes')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(res.body.boxes).toBeDefined();
        expect(Array.isArray(res.body.boxes)).toBeTruthy();
        res.body.boxes.forEach(box => {
            expect(box.status).toBe('unopened');
            expect(box.curioBox).toBeDefined();
        });
    });

    it('应该能开启盲盒（显示购买时确定的内容）', async () => {
        // 先购买盲盒，获取 userBoxId
        const purchaseRes = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 1
            })
            .expect(201);

        const userBoxId = purchaseRes.body.userBoxes[0].id;

        const res = await request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxId
            })
            .expect(200);


        expect(res.body.results).toBeDefined();
        expect(res.body.results[0].success).toBeTruthy();
        expect(res.body.results[0].drawnItem).toBeDefined();
        expect(res.body.results[0].drawnItem.name).toBe('Test Item');
    });

    it('应该能批量开启盲盒', async () => {
        // 先购买更多盲盒
        const purchaseRes = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 2
            });

        const userBoxIds = purchaseRes.body.userBoxes.map(box => box.id);

        const res = await request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxIds
            })
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