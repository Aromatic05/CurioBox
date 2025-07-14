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
        await authService.signUp({
            username: 'admin',
            password: 'admin',
            role: 'admin',
        });
        const adminLogin = await authService.signIn({
            username: 'admin',
            password: 'admin',
        });
        adminToken = adminLogin.accessToken;

        // 生成唯一测试用户名，避免重复
        const uniqueUsername = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // 创建测试用户并获取token
        await authService.signUp({
            username: uniqueUsername,
            password: 'test',
        });
        const { accessToken } = await authService.signIn({
            username: uniqueUsername,
            password: 'test',
        });
        userToken = accessToken;

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
                    { itemId: itemRes.body.id, probability: 1.0 },
                ],
            });

        // 主动查询盲盒详情，确保物品和概率已生效
        const boxDetail = await request(app.getHttpServer())
            .get(`/curio-boxes/${curioBoxId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        // 可选：断言盲盒内容
        expect(boxDetail.body.itemProbabilities.length).toBeGreaterThan(0);
    });

    it('应该能够购买盲盒（购买时确定内容）', async () => {
        const res = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 2,
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
        res.body.boxes.forEach((box) => {
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
                quantity: 1,
            })
            .expect(201);

        const userBoxId = purchaseRes.body.userBoxes[0].id;

        const res = await request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxId,
            })
            .expect(200);

        expect(res.body.results).toBeDefined();
        // 开盒操作本身应该成功
        expect(res.body.results[0].success).toBeTruthy();
        // drawnItem 可能是物品，也可能是 null，所以只检查它是否存在
        expect(res.body.results[0]).toHaveProperty('drawnItem');
    });

    it('应该能批量开启盲盒', async () => {
        // 先购买更多盲盒
        const purchaseRes = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 2,
            });

        const userBoxIds = purchaseRes.body.userBoxes.map((box) => box.id);

        const res = await request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxIds,
            })
            .expect(200);

        expect(res.body.results).toBeDefined();
        expect(res.body.results).toHaveLength(2);
        // 验证总开启数等于请求开启数
        expect(res.body.totalOpened).toBe(userBoxIds.length);
        res.body.results.forEach((result) => {
            // 验证每次开盒操作都成功
            expect(result.success).toBeTruthy();
            // 验证 drawnItem 属性存在
            expect(result).toHaveProperty('drawnItem');
        });
    });

    it('应该能通过 status=OPENED 查询已开启的盲盒', async () => {
        // 先购买并开启盲盒
        const purchaseRes = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 1 })
            .expect(201);
        const userBoxId = purchaseRes.body.userBoxes[0].id;
        await request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxId })
            .expect(200);
        // 查询已开启盲盒
        const res = await request(app.getHttpServer())
            .get('/me/boxes?status=OPENED')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(res.body.boxes).toBeDefined();
        expect(Array.isArray(res.body.boxes)).toBeTruthy();
        res.body.boxes.forEach((box) => {
            expect(box.status).toBe('opened');
            expect(box.curioBox).toBeDefined();
            // item 可能是 null，所以只检查属性存在
            expect(box).toHaveProperty('item');
        });
    });

    it('应该能通过 status=ALL 查询所有盲盒', async () => {
        // 先购买盲盒并开启其中一个
        const purchaseRes = await request(app.getHttpServer())
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 2 })
            .expect(201);
        const userBoxIds = purchaseRes.body.userBoxes.map((box) => box.id);
        await request(app.getHttpServer())
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxId: userBoxIds[0] })
            .expect(200);
        // 查询所有盲盒
        const res = await request(app.getHttpServer())
            .get('/me/boxes?status=ALL')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(res.body.boxes).toBeDefined();
        expect(Array.isArray(res.body.boxes)).toBeTruthy();
        // 应该包含 opened 和 unopened
        const statuses = res.body.boxes.map((box) => box.status);
        expect(statuses).toContain('opened');
        expect(statuses).toContain('unopened');
    });

    // 辅助函数，用于确保用户仓库中有物品
    const ensureItemInInventory = async () => {
        let attempts = 0;
        const maxAttempts = 10; // 防止无限循环
        while (attempts < maxAttempts) {
            const purchaseRes = await request(app.getHttpServer())
                .post('/orders/purchase')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ curioBoxId, quantity: 1 })
                .expect(201);
            const userBoxId = purchaseRes.body.userBoxes[0].id;
            await request(app.getHttpServer())
                .post('/me/boxes/open')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ userBoxId })
                .expect(200);

            const itemsRes = await request(app.getHttpServer())
                .get('/me/items')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            if (itemsRes.body.items && itemsRes.body.items.length > 0) {
                return itemsRes.body.items; // 成功获取到物品
            }
            attempts++;
        }
        throw new Error(
            'Failed to get an item in inventory after multiple attempts',
        );
    };

    it('应该能查询用户物品仓库', async () => {
        // 确保用户仓库里至少有一个物品
        const items = await ensureItemInInventory();

        // 查询物品仓库
        const res = await request(app.getHttpServer())
            .get('/me/items')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(res.body.items).toBeDefined();
        expect(Array.isArray(res.body.items)).toBeTruthy();
        expect(res.body.items.length).toBeGreaterThan(0);
        expect(res.body.items[0].itemId).toBeDefined();
        expect(res.body.items[0].count).toBeGreaterThanOrEqual(1);
    });

    it('应该能减少/删除用户物品', async () => {
        // 确保用户仓库里至少有一个物品
        const items = await ensureItemInInventory();
        const itemId = items[0].itemId;

        // 删除物品
        const delRes = await request(app.getHttpServer())
            .delete(`/me/items/${itemId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(delRes.body.success).toBeTruthy();
        expect(delRes.body.deleted).toBeTruthy();

        // 再查物品仓库，确认物品已减少或删除
        const itemsRes2 = await request(app.getHttpServer())
            .get('/me/items')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        const remainingItem = itemsRes2.body.items.find(
            (item) => item.itemId === itemId,
        );
        if (remainingItem) {
            // 如果物品还存在，其数量应该比之前少1
            const originalItem = items.find((item) => item.itemId === itemId);
            expect(remainingItem.count).toBe(originalItem.count - 1);
        } else {
            // 如果物品不存在，断言通过
            expect(remainingItem).toBeUndefined();
        }
    });

    afterEach(async () => {
        await app.close();
    });
});
