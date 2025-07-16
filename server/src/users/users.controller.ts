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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'Returns a user by ID.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @Get('users/:id')
    async getUserById(@Param('id') id: string) {
        return this.usersService.findPublicById(Number(id));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns a list of all users.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UseGuards(JwtAuthGuard)
    @Get('users')
    async getAllUsers(@Request() req: { user: { role?: string } }) {
        const userRole = req.user?.role ?? '';
        if (userRole !== 'admin') {
            throw new ForbiddenException('Only admin can view all users');
        }
        return this.usersService.findAllPublic();
    }
}
