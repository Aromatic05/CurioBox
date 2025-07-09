import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { UserBoxesModule } from '../user-boxes/user-boxes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, CurioBox]),
    UserBoxesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}