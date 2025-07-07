import { Module } from '@nestjs/common';
import { CurioBoxModule } from './curio-box/curio-box.module';

@Module({
  imports: [CurioBoxModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
