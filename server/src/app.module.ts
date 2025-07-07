import { Module } from '@nestjs/common';
import { CurioBoxModule } from './curio-box/curio-box.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { CurioBox } from './curio-box/entities/curio-box.entity';
import { ItemsModule } from './items/items.module';
import { Item } from './items/entities/item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'curiobox.db',
      entities: [User, CurioBox, Item], // 加上 Item
      synchronize: true,
    }),
    CurioBoxModule,
    AuthModule,
    ItemsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}