import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// 测试用 admin 和普通用户
const adminUser = {
    username: `admin_${Date.now()}`,
    password: 'adminpass123',
    role: 'admin',
};
const normalUser = {
    username: `user_${Date.now()}`,
    password: 'userpass123',
};


let adminToken: string;
let userToken: string;
let createdBoxId: number;
let createdItemId: number;

// 响应体类型定义
interface LoginResponse {
    accessToken: string;
}
interface ItemResponse {
    id: number;
}
interface CurioBoxResponse {
    id: number;
    items: any[];
    itemProbabilities: any[];
    coverImage: string;
    name?: string;
}
interface PatchBoxResponse {
    id: number;
    items: any[];
    itemProbabilities: any[];
}
interface PostsResponse {
    items: Array<{ id: number; curioBoxId: number }>;
}

describe('CurioBoxController (e2e)', () => {
    let app: NestExpressApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestExpressApplication>();
        // 注册静态资源目录，兼容 e2e 测试图片访问
        app.useStaticAssets(join(__dirname, '../uploads'), {
            prefix: '/static/',
        });
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // 注册 admin
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(adminUser)
            .expect(201);
        // 登录 admin
        const adminRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: adminUser.username,
                password: adminUser.password,
            })
            .expect(200);
        adminToken = (adminRes.body as LoginResponse).accessToken;

        // 注册普通用户
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(normalUser)
            .expect(201);
        // 登录普通用户
        const userRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: normalUser.username,
                password: normalUser.password,
            })
            .expect(200);
        userToken = (userRes.body as LoginResponse).accessToken;

        // 创建一个 item 供盲盒使用（用图片上传接口）
        const itemRes = await request(app.getHttpServer())
            .post('/items/upload')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'TestItem')
            .field('category', 'test')
            .field('stock', 10)
            .field('rarity', 'rare')
            .attach('image', __dirname + '/1.jpg')
            .expect(201);
        createdItemId = (itemRes.body as ItemResponse).id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /curio-boxes', () => {
        it('should not allow normal user to create', async () => {
            await request(app.getHttpServer())
                .post('/curio-boxes')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    name: 'TestBox',
                    description: 'desc',
                    price: 100,
                    boxCount: 1,
                    itemIds: [createdItemId],
                    itemProbabilities: [
                        { itemId: createdItemId, probability: 1 },
                    ],
                    category: 'test',
                })
                .expect(403);
        });
        it('should allow admin to create with cover image', async () => {
            const res = await request(app.getHttpServer())
                .post('/curio-boxes/upload')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('name', 'TestBox')
                .field('description', 'desc')
                .field('price', 100)
                .field('boxCount', 1)
                .field('category', 'test')
                .field('itemIds', `[${createdItemId}]`)
                .field('itemProbabilities', `[{"itemId":${createdItemId},"probability":1}]`)
                .attach('coverImage', __dirname + '/1.jpg')
                .expect(201);
            const body = res.body as CurioBoxResponse;
            expect(body).toHaveProperty('id');
            expect(body.items.length).toBe(1);
            expect(body.itemProbabilities.length).toBe(1);
            expect(body.coverImage).toMatch(/\/static\//);
            createdBoxId = body.id;

            // 新增：测试图片能否正常访问
            const imageUrl = body.coverImage;
            const imageRes = await request(app.getHttpServer())
                .get(imageUrl)
                .expect(200);
            expect(imageRes.headers['content-type']).toMatch(/^image\//);
            expect((imageRes.body as Buffer).length).toBeGreaterThan(0);
        });
    });

    describe('GET /curio-boxes', () => {
        it('should allow anyone to get all', async () => {
            const res = await request(app.getHttpServer())
                .get('/curio-boxes')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /curio-boxes/:id', () => {
        it('should return 404 for not found', async () => {
            await request(app.getHttpServer())
                .get('/curio-boxes/999999')
                .expect(404);
        });
        it('should get one by id', async () => {
            const res = await request(app.getHttpServer())
                .get(`/curio-boxes/${createdBoxId}`)
                .expect(200);
            expect(res.body).toHaveProperty('id', createdBoxId);
        });
    });

    describe('PATCH /curio-boxes/:id', () => {
        it('should not allow normal user to update', async () => {
            await request(app.getHttpServer())
                .patch(`/curio-boxes/${createdBoxId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'newName' })
                .expect(403);
        });
        it('should allow admin to update', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/curio-boxes/${createdBoxId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'newName' })
                .expect(200);
            expect((res.body as CurioBoxResponse).name).toBe('newName');
        });
    });

    describe('DELETE /curio-boxes/:id', () => {
        it('should not allow normal user to delete', async () => {
            await request(app.getHttpServer())
                .delete(`/curio-boxes/${createdBoxId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
        it('should allow admin to delete', async () => {
            await request(app.getHttpServer())
                .delete(`/curio-boxes/${createdBoxId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return 404 after delete', async () => {
            await request(app.getHttpServer())
                .get(`/curio-boxes/${createdBoxId}`)
                .expect(404);
        });
    });

    // PATCH /curio-boxes/:id/items-and-probabilities 测试提前到 DELETE 之前
    describe('PATCH /curio-boxes/:id/items-and-probabilities', () => {
        let patchBoxId: number;
        beforeAll(async () => {
            // 新建一个盲盒用于 PATCH 测试
            const res = await request(app.getHttpServer())
                .post('/curio-boxes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'PatchBox',
                    description: 'desc',
                    price: 100,
                    boxCount: 1,
                    itemIds: [createdItemId],
                    itemProbabilities: [
                        { itemId: createdItemId, probability: 1 },
                    ],
                    category: 'test',
                })
                .expect(201);
            patchBoxId = (res.body as CurioBoxResponse).id;
        });
        it('should allow admin to update items and probabilities', async () => {
            // 新建一个 item
            const itemRes = await request(app.getHttpServer())
                .post('/items')
                .send({
                    name: 'TestItem2',
                    image: 'http://test.com/item2.png',
                    category: 'test',
                    stock: 5,
                    rarity: 'epic',
                    curioBoxIds: [],
                })
                .expect(201);
            const newItemId = (itemRes.body as ItemResponse).id;
            const res = await request(app.getHttpServer())
                .patch(`/curio-boxes/${patchBoxId}/items-and-probabilities`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    itemIds: [createdItemId, newItemId],
                    itemProbabilities: [
                        { itemId: createdItemId, probability: 0.7 },
                        { itemId: newItemId, probability: 0.3 },
                    ],
                })
                .expect(200);
            const patchBody = res.body as PatchBoxResponse;
            expect(patchBody.items.length).toBe(2);
            expect(patchBody.itemProbabilities.length).toBe(2);
        });
    });

    // 新增：GET /curio-boxes/:id/posts 测试
    describe('GET /curio-boxes/:id/posts', () => {
        let postBoxId: number;
        let postId: number;
        beforeAll(async () => {
            // 新建一个盲盒
            const boxRes = await request(app.getHttpServer())
                .post('/curio-boxes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'PostBox',
                    description: 'desc',
                    price: 50,
                    boxCount: 1,
                    itemIds: [createdItemId],
                    itemProbabilities: [
                        { itemId: createdItemId, probability: 1 },
                    ],
                    category: 'test',
                })
                .expect(201);
            postBoxId = (boxRes.body as CurioBoxResponse).id;

            // 新建一个帖子并绑定到该盲盒
            const postRes = await request(app.getHttpServer())
                .post('/showcase/posts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: '盲盒帖子',
                    content: '内容',
                    images: [],
                    tagIds: [],
                    curioBoxId: postBoxId,
                })
                .expect(201);
            postId = (postRes.body as { id: number }).id;
        });
        it('should get posts by curioBoxId', async () => {
            const res = await request(app.getHttpServer())
                .get(`/curio-boxes/${postBoxId}/posts`)
                .expect(200);
            const postsBody = res.body as PostsResponse;
            expect(Array.isArray(postsBody.items)).toBe(true);
            expect(postsBody.items.length).toBeGreaterThan(0);
            const found = postsBody.items.find((p) => p.id === postId);
            expect(found).toBeDefined();
            expect(found!.curioBoxId).toBe(postBoxId);
        });
    });
});
