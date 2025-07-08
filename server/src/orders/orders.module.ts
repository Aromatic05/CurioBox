import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { Item } from '../items/entities/item.entity';
import { BlocklistedToken } from '../auth/entities/blocklisted-token.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, CurioBox, Item, BlocklistedToken])
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }