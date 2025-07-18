import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, ForbiddenException } from '@nestjs/common';
import { UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetNicknameDto } from './dto/set-nickname.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ENTRYDIR } from '../constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @ApiOperation({ summary: 'User registration' })
    @ApiResponse({ status: 201, description: 'User registered successfully.' })
    @ApiResponse({ status: 409, description: 'Username already exists.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiBody({ type: CreateUserDto, description: '注册请求体，包含用户名、密码、可选角色' })
    @Post('register')
    signUp(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'User logged in successfully, returns accessToken.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ type: LoginDto, description: '登录请求体，包含用户名和密码' })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    signIn(@Body() loginDto: LoginDto) {
        return this.authService.signIn(loginDto);
    }

    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Access token refreshed successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ schema: { example: { refreshToken: 'string' } }, description: '刷新token请求体，包含refreshToken字段' })
    // @UseGuards(JwtAuthGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: { refreshToken: string }) {
        return await this.authService.refreshToken(body.refreshToken);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ type: ChangePasswordDto, description: '修改密码请求体，包含oldPassword和newPassword' })
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    changePassword(
        @Request() req: { user: { sub: number } },
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(req.user.sub, changePasswordDto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({ status: 200, description: 'Logged out successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @UseGuards(JwtAuthGuard)
    @Get('logout')
    logout(@Request() req: { headers: { authorization: string } }) {
        const authHeader = req.headers.authorization;
        const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : '';
        return this.authService.logout(token);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set or update user nickname' })
    @ApiResponse({ status: 200, description: 'Nickname updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ type: SetNicknameDto })
    @UseGuards(JwtAuthGuard)
    @Post('set-nickname')
    @HttpCode(HttpStatus.OK)
    setNickname(
        @Request() req: { user: { sub: number } },
        @Body() body: SetNicknameDto
    ) {
        return this.authService.setNickname(req.user.sub, body.nickname);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Returns current user profile.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req: { user: { sub: number } }) {
        const user = await this.usersService.findPublicById(req.user.sub);
        return user;
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload avatar image' })
    @ApiResponse({ status: 200, description: 'Avatar image uploaded successfully, returns URL.' })
    @ApiResponse({ status: 400, description: 'Bad Request (e.g., invalid file type or size).' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @Post('upload-avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: path.join(ENTRYDIR, 'uploads'),
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(
                        null,
                        `${randomName}${extname(file.originalname)}`,
                    );
                },
            }),
        }),
    )
    async uploadAvatar(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ): Promise<{ url: string }> {
        const url = `/static/${file.filename}`;
        return Promise.resolve({ url });
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set user avatar' })
    @ApiResponse({ status: 200, description: 'Avatar updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ type: SetAvatarDto })
    @UseGuards(JwtAuthGuard)
    @Post('set-avatar')
    @HttpCode(HttpStatus.OK)
    setAvatar(
        @Request() req: { user: { sub: number } },
        @Body() body: SetAvatarDto
    ) {
        return this.authService.setAvatar(req.user.sub, body.avatar);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete user (self or admin)' })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiBody({ type: DeleteUserDto })
    @UseGuards(JwtAuthGuard)
    @Post('delete-user')
    @HttpCode(HttpStatus.OK)
    async deleteUser(
        @Request() req: { user: { sub: number; role: string } },
        @Body() body: DeleteUserDto
    ) {
        const targetUserId = body.userId;
        if (req.user.role !== 'admin' && targetUserId && targetUserId !== req.user.sub) {
            throw new ForbiddenException('No permission to delete other users');
        }
        return await this.authService.setUserStatus(targetUserId || req.user.sub, req.user.role, 'deleted');
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ban user (admin only)' })
    @ApiResponse({ status: 200, description: 'User banned successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiBody({ type: BanUserDto })
    @UseGuards(JwtAuthGuard)
    @Post('ban-user')
    @HttpCode(HttpStatus.OK)
    async banUser(
        @Request() req: { user: { role: string } },
        @Body() body: BanUserDto
    ) {
        if (req.user.role !== 'admin') {
            throw new ForbiddenException('No permission');
        }
        return await this.authService.setUserStatus(body.userId, req.user.role, 'banned');
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unban user (admin only)' })
    @ApiResponse({ status: 200, description: 'User unbanned successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiBody({ type: UnbanUserDto })
    @UseGuards(JwtAuthGuard)
    @Post('unban-user')
    @HttpCode(HttpStatus.OK)
    async unbanUser(
        @Request() req: { user: { role: string } },
        @Body() body: UnbanUserDto
    ) {
        if (req.user.role !== 'admin') {
            throw new ForbiddenException('No permission');
        }
        return await this.authService.setUserStatus(body.userId, req.user.role, 'active');
    }
}
