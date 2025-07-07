import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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


describe('CurioBoxController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
      .send({ username: adminUser.username, password: adminUser.password })
      .expect(200);
    adminToken = adminRes.body.accessToken;

    // 注册普通用户
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(normalUser)
      .expect(201);
    // 登录普通用户
    const userRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: normalUser.username, password: normalUser.password })
      .expect(200);
    userToken = userRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /curio-boxes', () => {
    it('should not allow normal user to create', async () => {
      await request(app.getHttpServer())
        .post('/curio-boxes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'TestBox', description: 'desc', price: 100 })
        .expect(403);
    });
    it('should allow admin to create', async () => {
      const res = await request(app.getHttpServer())
        .post('/curio-boxes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'TestBox', description: 'desc', price: 100 })
        .expect(201);
      expect(res.body).toHaveProperty('id');
      createdBoxId = res.body.id;
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
      expect(res.body.name).toBe('newName');
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

  describe('GET /curio-boxes/search', () => {
    it('should search by name', async () => {
      // 先创建一个
      await request(app.getHttpServer())
        .post('/curio-boxes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'UniqueBox', description: 'desc', price: 200 })
        .expect(201);
      const res = await request(app.getHttpServer())
        .get('/curio-boxes/search?q=UniqueBox')
        .expect(200);
      expect(res.body.some((box: any) => box.name === 'UniqueBox')).toBe(true);
    });
  });
});
