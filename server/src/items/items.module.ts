import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { BlocklistedToken } from '../auth/entities/blocklisted-token.entity';
import { Item } from './entities/item.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { UserItem } from './entities/user-item.entity';
import { UserItemsService } from './user-items.service';
import { UserItemsController } from './user-items.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([BlocklistedToken, Item, CurioBox, UserItem]), AuthModule],
    controllers: [ItemsController, UserItemsController],
    providers: [ItemsService, UserItemsService],
    exports: [UserItemsService],
})
export class ItemsModule {}
