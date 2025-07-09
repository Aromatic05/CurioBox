import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm'; // 导入
import { User } from '../users/user.entity';     // 导入
import { JwtStrategy } from './jwt.strategy';     // 导入
import { BlocklistedToken } from './entities/blocklisted-token.entity';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlocklistedToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'yourSecretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard],
  exports: [
    RolesGuard,
    JwtAuthGuard,
    TypeOrmModule, // 关键：导出 TypeOrmModule
  ],
})
export class AuthModule {}