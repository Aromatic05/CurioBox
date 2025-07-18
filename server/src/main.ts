import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENTRYDIR } from './constants';

async function bootstrap() {
    // 需要显式指定类型为 NestExpressApplication
    const app = await NestFactory.create<NestExpressApplication>(AppModule);


    // 配置全局 API 路由前缀
    app.setGlobalPrefix('api');
    // 配置静态资源目录（前端构建产物）
    app.useStaticAssets(join(ENTRYDIR, 'public'), {
        prefix: '/',
    });
    // 配置静态资源目录（上传文件）
    app.useStaticAssets(join(ENTRYDIR, 'uploads'), {
        prefix: '/static/',
    });

    console.log('Static assets dir:', join(ENTRYDIR, 'uploads'));
    console.log('Frontend public dir:', join(ENTRYDIR, 'public'));

    // 启用 CORS，允许前端跨域访问
    app.enableCors({
        origin: ['http://localhost:5173', 'http://192.168.0.153:5173',
                 'http://localhost:4173', 'http://192.168.0.153:4173',
                 'http://localhost:3000', 'http://192.168.0.153:3000'
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
    SwaggerModule.setup('api', app, document, {
      customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
      customJs: [
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js'
      ]
    });

    // SPA fallback: 兜底所有非 API/静态资源的 GET 请求，返回前端 index.html
    const { readFileSync } = await import('fs');
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get(/^\/(?!api|static|uploads|public|favicon\.ico).*/, (req, res) => {
      res.type('html').send(readFileSync(join(__dirname, '.', 'public', 'index.html'), 'utf-8'));
    });

    // 监听 0.0.0.0 允许局域网访问
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
