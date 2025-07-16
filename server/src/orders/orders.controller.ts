import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
    NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchaseCurioBoxDto } from './dto/purchase-curio-box.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Purchase curio boxes' })
    @ApiResponse({ status: 201, description: 'Curio boxes purchased successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @ApiResponse({ status: 400, description: 'Bad Request (e.g., insufficient item stock).' })
    @Post('orders/purchase')
    async purchase(
        @Body() purchaseCurioBoxDto: PurchaseCurioBoxDto,
        @Request() req: { user: { sub: number | string } }
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        const result = await this.ordersService.purchase(
            userId,
            purchaseCurioBoxDto,
        );
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user\'s orders' })
    @ApiResponse({ status: 200, description: 'Returns a list of current user\'s orders.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @Get('orders')
    findAllByUser(@Request() req: { user: { sub: number | string } }) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.ordersService.findAllByUser(userId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all orders (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns a list of all orders.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Get('orders/all')
    async findAll() {
        return this.ordersService.findAll();
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get single order details' })
    @ApiResponse({ status: 200, description: 'Returns a single order with details.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Order not found or not belonging to user.' })
    @Get('orders/:id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: { user: { sub: number | string } }
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
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
