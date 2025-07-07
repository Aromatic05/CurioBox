import { Module } from '@nestjs/common';
import { CurioBoxModule } from './curio-box/curio-box.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { CurioBox } from './curio-box/entities/curio-box.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'curiobox.db',
      entities: [User, CurioBox], // 这里加上 CurioBox
      synchronize: true,
    }),
    CurioBoxModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}