import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as http from 'http';
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
    // let userBoxId: number; // 已移除未使用变量

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

        // 1. 先创建测试物品
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
        const testItemId = (itemRes.body as { id: number }).id; // 获取物品ID

        // 2. 在创建盲盒时，直接带上物品信息
        const curioBoxRes = await request(app.getHttpServer() as http.Server)
            .post('/curio-boxes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Box',
                description: 'A box for testing',
                price: 9.99,
                boxCount: 10,
                category: 'test',
                // 直接在创建时就关联物品和概率
                itemIds: [testItemId], 
                itemProbabilities: [
                    { itemId: testItemId, probability: 1.0 },
                ],
            });
        curioBoxId = (curioBoxRes.body as { id: number }).id;
        // 3. 不再需要 PATCH 和后续的 GET 验证，因为盲盒在创建时就是完整的
    });

    it('应该能够购买盲盒（购买时确定内容）', async () => {
        const res = await request(app.getHttpServer() as http.Server)
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 2,
            })
            .expect(201);

        const purchaseBody = res.body as { message: string; order: any; userBoxes: Array<{ id: number; status: string }> };
        expect(purchaseBody.message).toBe('购买成功');
        expect(purchaseBody.order).toBeDefined();
        expect(Array.isArray(purchaseBody.userBoxes)).toBeTruthy();
        expect(purchaseBody.userBoxes).toHaveLength(2);
        expect(purchaseBody.userBoxes[0].status).toBe('unopened');
    });

    it('应该能查看未开启的盲盒列表', async () => {
        const res = await request(app.getHttpServer() as http.Server)
            .get('/me/boxes')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        const boxesBody = res.body as { boxes: Array<{ status: string; curioBox: any }> };
        expect(boxesBody.boxes).toBeDefined();
        expect(Array.isArray(boxesBody.boxes)).toBeTruthy();
        boxesBody.boxes.forEach((box) => {
            expect(box.status).toBe('unopened');
            expect(box.curioBox).toBeDefined();
        });
    });

    it('应该能开启盲盒（显示购买时确定的内容）', async () => {
        // 先购买盲盒，获取 userBoxId
        const purchaseRes = await request(app.getHttpServer() as http.Server)
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 1,
            })
            .expect(201);

        const userBoxId = (purchaseRes.body as { userBoxes: Array<{ id: number }> }).userBoxes[0].id;

        const res = await request(app.getHttpServer() as http.Server)
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxId,
            })
            .expect(200);
        console.log(res.body);

        const openBody = res.body as { results: Array<{ success: boolean; drawnItem: { name: string } }> };
        expect(openBody.results).toBeDefined();
        expect(openBody.results[0].success).toBeTruthy();
        expect(openBody.results[0].drawnItem).toBeDefined();
        expect(openBody.results[0].drawnItem.name).toBe('Test Item');
    });

    it('应该能批量开启盲盒', async () => {
        // 先购买更多盲盒
        const purchaseRes = await request(app.getHttpServer() as http.Server)
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                curioBoxId,
                quantity: 2,
            });

        const userBoxIds = (purchaseRes.body as { userBoxes: Array<{ id: number }> }).userBoxes.map((box) => box.id);

        const res = await request(app.getHttpServer() as http.Server)
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userBoxIds,
            })
            .expect(200);

        const batchOpenBody = res.body as { results: Array<{ success: boolean; drawnItem: any }>; totalOpened: number };
        expect(batchOpenBody.results).toBeDefined();
        expect(batchOpenBody.results).toHaveLength(2);
        expect(batchOpenBody.totalOpened).toBe(2);
        batchOpenBody.results.forEach((result) => {
            expect(result.success).toBeTruthy();
            expect(result.drawnItem).toBeDefined();
        });
    });

    it('应该能通过 status=OPENED 查询已开启的盲盒', async () => {
        // 先购买并开启盲盒
        const purchaseRes = await request(app.getHttpServer() as http.Server)
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 1 })
            .expect(201);
        const userBoxId = (purchaseRes.body as { userBoxes: Array<{ id: number }> }).userBoxes[0].id;
        await request(app.getHttpServer() as http.Server)
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxId })
            .expect(200);
        // 查询已开启盲盒
        const res = await request(app.getHttpServer() as http.Server)
            .get('/me/boxes?status=OPENED')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        const openedBoxesBody = res.body as { boxes: Array<{ status: string; curioBox: any; item: any }> };
        expect(openedBoxesBody.boxes).toBeDefined();
        expect(Array.isArray(openedBoxesBody.boxes)).toBeTruthy();
        openedBoxesBody.boxes.forEach((box) => {
            expect(box.status).toBe('opened');
            expect(box.curioBox).toBeDefined();
            expect(box.item).toBeDefined();
        });
    });

    it('应该能通过 status=ALL 查询所有盲盒', async () => {
        // 先购买盲盒并开启其中一个
        const purchaseRes = await request(app.getHttpServer() as http.Server)
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 2 })
            .expect(201);
        const userBoxIds = (purchaseRes.body as { userBoxes: Array<{ id: number }> }).userBoxes.map((box) => box.id);
        await request(app.getHttpServer() as http.Server)
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxId: userBoxIds[0] })
            .expect(200);
        // 查询所有盲盒
        const res = await request(app.getHttpServer() as http.Server)
            .get('/me/boxes?status=ALL')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        const allBoxesBody = res.body as { boxes: Array<{ status: string }> };
        expect(allBoxesBody.boxes).toBeDefined();
        expect(Array.isArray(allBoxesBody.boxes)).toBeTruthy();
        // 应该包含 opened 和 unopened
        const statuses = allBoxesBody.boxes.map((box) => box.status);
        expect(statuses).toContain('opened');
        expect(statuses).toContain('unopened');
    });

    it('应该能查询用户物品仓库', async () => {
        // 购买并开启盲盒，获得 item
        const purchaseRes = await request(app.getHttpServer() as http.Server)
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 1 })
            .expect(201);
        const userBoxId = (purchaseRes.body as { userBoxes: Array<{ id: number }> }).userBoxes[0].id;
        await request(app.getHttpServer() as http.Server)
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxId })
            .expect(200);
        // 查询物品仓库
        const res = await request(app.getHttpServer())
            .get('/me/items')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        const itemsBody = res.body as { items: Array<{ itemId: number; count: number }> };
        expect(itemsBody.items).toBeDefined();
        expect(Array.isArray(itemsBody.items)).toBeTruthy();
        expect(itemsBody.items[0].itemId).toBeDefined();
        expect(itemsBody.items[0].count).toBe(1);
    });

    it('应该能减少/删除用户物品', async () => {
        // 购买并开启盲盒，获得 item
        const purchaseRes = await request(app.getHttpServer() as http.Server)
            .post('/orders/purchase')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ curioBoxId, quantity: 1 })
            .expect(201);
        const userBoxId = (purchaseRes.body as { userBoxes: Array<{ id: number }> }).userBoxes[0].id;
        await request(app.getHttpServer() as http.Server)
            .post('/me/boxes/open')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ userBoxId })
            .expect(200);
        // 查询物品仓库，获取 itemId
        const itemsRes = await request(app.getHttpServer() as http.Server)
            .get('/me/items')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        const itemId = (itemsRes.body as { items: Array<{ itemId: number }> }).items[0].itemId;
        // 删除物品
        const delRes = await request(app.getHttpServer() as http.Server)
            .delete(`/me/items/${itemId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        const delBody = delRes.body as { success: boolean; deleted: boolean };
        expect(delBody.success).toBeTruthy();
        expect(delBody.deleted).toBeTruthy();
        // 再查物品仓库应为空
        const itemsRes2 = await request(app.getHttpServer() as http.Server)
            .get('/me/items')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        const items2Body = itemsRes2.body as { items: any[] };
        expect(items2Body.items.length).toBe(0);
    });
});