import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserBoxDto } from '../user-boxes/dto/create-user-box.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // 购买盲盒（改造原有的抽盒接口）
    @Post('orders/purchase')
    async purchase(@Body() createUserBoxDto: CreateUserBoxDto, @Request() req) {
        const userId = req.user.id || req.user.sub;
        const result = await this.ordersService.purchase(userId, createUserBoxDto);
        
        return {
            message: '购买成功',
            order: {
                id: result.order.id,
                price: result.order.price,
                status: result.order.status,
            },
            userBoxes: result.userBoxes,
        };
    }

    // 获取用户订单列表
    @Get('orders')
    findAllByUser(@Request() req) {
        const userId = req.user.id || req.user.sub;
        return this.ordersService.findAllByUser(userId);
    }

    // 获取订单详情
    @Get('orders/:id')
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.id || req.user.sub;
        if (isNaN(id)) {
            throw new NotFoundException('订单ID无效');
        }
        const order = await this.ordersService.findOne(id, userId);
        if (!order) {
            throw new NotFoundException('订单不存在');
        }
        return order;
    }
}