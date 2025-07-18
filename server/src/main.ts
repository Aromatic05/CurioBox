import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    // 需要显式指定类型为 NestExpressApplication
    const app = await NestFactory.create<NestExpressApplication>(AppModule);


    // 配置静态资源目录（前端构建产物）
    app.useStaticAssets(join(__dirname, '.', 'public'), {
        prefix: '/',
    });
    // 配置静态资源目录（上传文件）
    app.useStaticAssets(join(__dirname, '.', 'uploads'), {
        prefix: '/static/',
    });

    console.log('Static assets dir:', join(__dirname, '..', 'uploads'));
    console.log('Frontend public dir:', join(__dirname, '..', 'public'));

    // 启用 CORS，允许前端跨域访问
    app.enableCors({
        origin: ['http://localhost:5173', 'http://192.168.0.153:5173',
                 'http://localhost:4173', 'http://192.168.0.153:4173'
        ], // 允许局域网访问
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('CurioBox API')
        .setDescription('The CurioBox API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // 监听 0.0.0.0 允许局域网访问
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
