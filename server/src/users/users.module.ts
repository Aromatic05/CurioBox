import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)], // Add AuthModule here
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // 导出 UsersService 以便其他模块使用
})
export class UsersModule {}
