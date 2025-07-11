import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // 需要显式指定类型为 NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 配置静态资源目录
  // 'uploads' 是存放文件的文件夹名
  // '/static' 是暴露给外部访问的虚拟路径
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/static/',
  });

  console.log('Static assets dir:', join(__dirname, '..', 'uploads'));

  // 启用 CORS，允许前端跨域访问
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
