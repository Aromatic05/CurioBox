import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
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
    
    // 注册管理员和普通用户，保证密码加密
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(adminUser)
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(regularUser)
      .expect(201);

    // 1. 管理员登录获取Token
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: adminUser.username, password: adminUser.password });
    adminToken = adminLoginRes.body.accessToken;

    // 2. 管理员创建 CurioBox
    const curioBoxRes = await request(app.getHttpServer())
      .post('/curio-boxes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Box',
        description: 'A box for testing',
        price: 9.99,
        coverImage: 'http://example.com/image.png',
      });
    curioBoxId = curioBoxRes.body.id;

    // 3. 管理员向Box中添加Items (需要先实现Items的创建接口)
    // 假设你已经在ItemsController中实现了POST /items接口
    for (let i = 1; i <= 3; i++) {
      await request(app.getHttpServer())
        .post('/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Item ${i}`,
          image: `http://example.com/item${i}.png`,
          weight: 10 * i,
          curioBoxId: curioBoxId
        });
    }

    // 4. 普通用户登录获取Token
    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: regularUser.username, password: regularUser.password });
    userToken = userLoginRes.body.accessToken;
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('/orders/draw (POST)', () => {
    it('should fail if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/orders/draw')
        .send({ curioBoxId })
        .expect(401);
    });
    
    // 注意：此测试依赖于你已向 CurioBox 中添加了 Items。
    // 如果没有实现添加 Item 的接口，可以手动在测试前通过 service 添加。
    // 这里我们先跳过实际抽奖，假设接口能被调用
    it('should create an order when drawing a box', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders/draw')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ curioBoxId })
        .expect(201);
      
      expect(res.body).toHaveProperty('id');
      expect(res.body.price).toEqual('9.99');
      expect(res.body.curioBox.id).toEqual(curioBoxId);
      expect(res.body).toHaveProperty('drawnItem');
      createdOrderId = res.body.id;
    });

    it('should return 404 if curioBoxId does not exist', () => {
      return request(app.getHttpServer())
        .post('/orders/draw')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ curioBoxId: 9999 })
        .expect(404);
    });
  });

  describe('/orders (GET)', () => {
    it('should fail if not authenticated', () => {
      return request(app.getHttpServer()).get('/orders').expect(401);
    });

    it('should verify userToken is valid', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it.skip('should return a list of orders for the current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].id).toEqual(createdOrderId);
    });
  });
  
  describe('/orders/:id (GET)', () => {
    it('should fail if not authenticated', () => {
      return request(app.getHttpServer()).get(`/orders/${createdOrderId || 1}`).expect(401);
    });

    it.skip('should return a single order by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(res.body.id).toEqual(createdOrderId);
      expect(res.body.user).toBeDefined(); // 确认关联加载
    });
    
    it.skip('should return 404 when trying to access another user\'s order', () => {
      // 使用管理员的Token去访问普通用户的订单
      return request(app.getHttpServer())
        .get(`/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`) // 管理员Token
        .expect(404);
    });
  });
});