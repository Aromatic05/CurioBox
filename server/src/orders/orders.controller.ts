import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard) // 整个控制器下的所有路由都需要登录
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post('draw')
    draw(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        return this.ordersService.draw(createOrderDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.ordersService.findAllForUser(req.user);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const currentUserId = req.user.id ?? req.user.sub;
        const user = { id: currentUserId } as any;
        const order = await this.ordersService.findOneForUser(id, user);
        if (!order || order.userId !== currentUserId) {
            throw new NotFoundException('Order not found or access denied');
        }
        return order;
    }
}