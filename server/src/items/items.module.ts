import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { BlocklistedToken } from '../auth/entities/blocklisted-token.entity';
import { Item } from './entities/item.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity'; // 导入

@Module({
    imports: [TypeOrmModule.forFeature([BlocklistedToken, Item, CurioBox])],
    controllers: [ItemsController],
    providers: [ItemsService],
})
export class ItemsModule {}
