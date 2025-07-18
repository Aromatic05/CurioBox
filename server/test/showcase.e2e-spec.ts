import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as http from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { CreatePostDto } from '../src/showcase/dto/create-post.dto';
import { CreateCommentDto } from '../src/showcase/dto/create-comment.dto';

describe('ShowcaseController (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;
    let userToken: string;
    let testPostId: number;
    let testCommentId: number;
    let testTagId: number;
    // 增加随机后缀，保证每次测试唯一
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const testUsername = `test-showcase-user-${randomSuffix}`;
    const testTagName = `test-tag-${randomSuffix}`;
    const testPostTitle = `test post ${randomSuffix}`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        authService = moduleFixture.get<AuthService>(AuthService);

        // 创建测试用户并获取token
        await authService.signUp({
            username: testUsername,
            password: 'test123',
        });

        const result = await authService.signIn({
            username: testUsername,
            password: 'test123',
        });
        userToken = result.accessToken;
    }, 30000); // 增加超时时间到30秒

    describe('标签管理', () => {
        it('应该创建一个新标签', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .post('/showcase/tags')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    name: testTagName,
                    description: 'test tag description',
                });

            expect(response.status).toBe(201);
            const tagBody = response.body as { id: string | number; name: string };
            expect(tagBody).toHaveProperty('id');
            expect(tagBody.name).toBe(testTagName);
            testTagId = parseInt(tagBody.id as string, 10);
        }, 10000);

        it('应该获取所有标签', async () => {
            const response = await request(app.getHttpServer() as http.Server).get(
                '/showcase/tags',
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        }, 10000);
    });

    describe('帖子管理', () => {
        it('应该创建一个新帖子', async () => {
            const createPostDto: CreatePostDto = {
                title: testPostTitle,
                content: 'test post content',
                images: ['test-image-1.jpg', 'test-image-2.jpg'],
                tagIds: [testTagId],
            };

            const response = await request(app.getHttpServer() as http.Server)
                .post('/showcase/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send(createPostDto);

            expect(response.status).toBe(201);
            const postBody = response.body as { id: string | number; title: string };
            expect(postBody).toHaveProperty('id');
            expect(postBody.title).toBe(createPostDto.title);
            testPostId = parseInt(postBody.id as string, 10);
        }, 10000);

        it('应该点赞帖子', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .post(`/showcase/posts/${testPostId}/like`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });

        it('应该返回已点赞状态', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .get(`/showcase/posts/${testPostId}/liked`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ liked: true });
        });

        it('重复点赞应该报错', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .post(`/showcase/posts/${testPostId}/like`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(400);
        });

        it('应该获取当前用户点赞过的帖子', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .get('/showcase/me/liked-posts')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((p: any) => parseInt(p.id, 10) === testPostId)).toBe(true);
        });

        it('应该取消点赞', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .delete(`/showcase/posts/${testPostId}/like`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });

        it('取消点赞后应该返回未点赞状态', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .get(`/showcase/posts/${testPostId}/liked`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ liked: false });
        });

        it('应该修改帖子内容', async () => {
            const newTitle = testPostTitle + ' updated';
            const response = await request(app.getHttpServer() as http.Server)
                .put(`/showcase/posts/${testPostId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: newTitle });

            expect(response.status).toBe(200);
            const postBody = response.body as { title: string };
            expect(postBody.title).toBe(newTitle);
        }, 10000);

        it('应该获取帖子列表', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .get('/showcase/posts')
                .query({
                    sortBy: 'latest',
                    page: 1,
                    pageSize: 10,
                });

            expect(response.status).toBe(200);
            const listBody = response.body as { items: any[]; meta: any };
            expect(listBody).toHaveProperty('items');
            expect(listBody).toHaveProperty('meta');
            expect(Array.isArray(listBody.items)).toBe(true);
        }, 10000);

        it('应该获取单个帖子详情', async () => {
            const response = await request(app.getHttpServer() as http.Server).get(
                `/showcase/posts/${testPostId}`,
            );

            expect(response.status).toBe(200);
            const postBody = response.body as { id: string | number };
            expect(parseInt(postBody.id as string, 10)).toBe(testPostId);
        }, 10000);
    });

    describe('评论管理', () => {
        let replyCommentId: number;

        it('应该发表评论', async () => {
            const createCommentDto: CreateCommentDto = {
                content: 'test comment',
                postId: testPostId,
            };

            const response = await request(app.getHttpServer() as http.Server)
                .post('/showcase/comments')
                .set('Authorization', `Bearer ${userToken}`)
                .send(createCommentDto);

            expect(response.status).toBe(201);
            const commentBody = response.body as { id: string | number; content: string };
            expect(commentBody).toHaveProperty('id');
            expect(commentBody.content).toBe(createCommentDto.content);
            testCommentId = parseInt(commentBody.id as string, 10);
        }, 10000);

        it('应该获取帖子的评论列表', async () => {
            const response = await request(app.getHttpServer() as http.Server).get(
                `/showcase/posts/${testPostId}/comments`,
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        }, 10000);

        it('应该回复评论', async () => {
            const createReplyDto: CreateCommentDto = {
                content: 'test reply',
                postId: testPostId,
                parentId: testCommentId,
            };

            const response = await request(app.getHttpServer() as http.Server)
                .post('/showcase/comments')
                .set('Authorization', `Bearer ${userToken}`)
                .send(createReplyDto);

            expect(response.status).toBe(201);
            const replyBody = response.body as { id: string | number; parentId: string | number };
            expect(parseInt(replyBody.parentId as string, 10)).toBe(testCommentId);
            replyCommentId = parseInt(replyBody.id as string, 10);
        }, 10000);

        it('应该删除回复评论', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .delete(`/showcase/comments/${replyCommentId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
        }, 10000);

        it('应该删除主评论', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .delete(`/showcase/comments/${testCommentId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
        }, 10000);
    });

    describe('帖子管理-删除', () => {
        it('应该删除帖子', async () => {
            const response = await request(app.getHttpServer() as http.Server)
                .delete(`/showcase/posts/${testPostId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect((response.body as { message: string }).message).toBeDefined();
        }, 10000);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });
});
