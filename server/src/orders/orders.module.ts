import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { UserBox } from '../user-boxes/entities/user-box.entity';
import { Item } from '../items/entities/item.entity';
import { UserBoxesModule } from '../user-boxes/user-boxes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, CurioBox, UserBox, Item]),
        UserBoxesModule,
        AuthModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule {}
