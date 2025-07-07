import { Module } from '@nestjs/common';
import { CurioBoxModule } from './curio-box/curio-box.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CurioBoxModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
