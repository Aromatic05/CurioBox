import {
    Controller,
    Get,
    Param,
    UseGuards,
    ForbiddenException,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('users/:id')
    async getUserById(@Param('id') id: string) {
        // 转为 number 类型
        return this.usersService.findPublicById(Number(id));
    }

    // 获取所有用户（仅管理员）
    @UseGuards(JwtAuthGuard)
    @Get('users')
    async getAllUsers(@Request() req: any) {
        if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all users');
        }
        return this.usersService.findAllPublic();
    }
}
