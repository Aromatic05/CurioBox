import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurioBoxModule } from './curio-box/curio-box.module';

@Module({
  imports: [CurioBoxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
