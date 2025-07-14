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

@Controller('me/items')
@UseGuards(JwtAuthGuard)
export class UserItemsController {
    constructor(private readonly userItemsService: UserItemsService) {}

    // 查询用户所有 item
    @Get()
    async getUserItems(@Request() req) {
        const items = await this.userItemsService.findAllByUser(req.user.sub);
        return { items };
    }

    // 删除/减少 item
    @Delete(':itemId')
    async removeUserItem(
        @Request() req,
        @Param('itemId') itemId: number,
        @Query('count') count: number = 1,
    ) {
        return await this.userItemsService.removeItem(req.user.sub, itemId, Number(count));
    }
}
