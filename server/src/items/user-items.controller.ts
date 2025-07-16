import {
    Controller,
    Get,
    Delete,
    Query,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UserItemsService } from './user-items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('User Items')
@Controller('me/items')
@UseGuards(JwtAuthGuard)
export class UserItemsController {
    constructor(private readonly userItemsService: UserItemsService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all items owned by the current user' })
    @ApiResponse({ status: 200, description: 'Returns a list of items owned by the user.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @Get()
    async getUserItems(@Request() req: { user: { sub: number } }) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        const items = await this.userItemsService.findAllByUser(userId);
        return { items };
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete or reduce the quantity of a specific item owned by the current user' })
    @ApiQuery({ name: 'count', required: false, description: 'Quantity to reduce (defaults to 1)' })
    @ApiResponse({ status: 200, description: 'Item quantity updated or item deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Item not found.' })
    @Delete(':itemId')
    async removeUserItem(
        @Request() req: { user: { sub: number } },
        @Param('itemId') itemId: number,
        @Query('count') count: number = 1,
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return await this.userItemsService.removeItem(userId, itemId, Number(count));
    }
}
