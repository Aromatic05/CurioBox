import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
      const response = await request(app.getHttpServer())
        .post('/showcase/tags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: testTagName,
          description: 'test tag description',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testTagName);
      testTagId = parseInt(response.body.id, 10);
    }, 10000);

    it('应该获取所有标签', async () => {
      const response = await request(app.getHttpServer())
        .get('/showcase/tags');

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

      const response = await request(app.getHttpServer())
        .post('/showcase/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createPostDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createPostDto.title);
      testPostId = parseInt(response.body.id, 10);
    }, 10000);

    it('应该获取帖子列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/showcase/posts')
        .query({
          sortBy: 'latest',
          page: 1,
          pageSize: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.items)).toBe(true);
    }, 10000);

    it('应该获取单个帖子详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/showcase/posts/${testPostId}`);

      expect(response.status).toBe(200);
      expect(parseInt(response.body.id, 10)).toBe(testPostId);
    }, 10000);
  });

  describe('评论管理', () => {
    it('应该发表评论', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'test comment',
        postId: testPostId,
      };

      const response = await request(app.getHttpServer())
        .post('/showcase/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createCommentDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(createCommentDto.content);
      testCommentId = parseInt(response.body.id, 10);
    }, 10000);

    it('应该获取帖子的评论列表', async () => {
      const response = await request(app.getHttpServer())
        .get(`/showcase/posts/${testPostId}/comments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    }, 10000);

    it('应该回复评论', async () => {
      const createReplyDto: CreateCommentDto = {
        content: 'test reply',
        postId: testPostId,
        parentId: testCommentId,
      };

      const response = await request(app.getHttpServer())
        .post('/showcase/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createReplyDto);

      expect(response.status).toBe(201);
      expect(parseInt(response.body.parentId, 10)).toBe(testCommentId);
    }, 10000);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});