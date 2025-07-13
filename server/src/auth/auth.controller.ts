import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import {UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * 用户注册端点
     * POST /auth/register
     * @param createUserDto 包含用户名和密码的对象
     */
    @Post('register')
    signUp(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    /**
     * 用户登录端点
     * POST /auth/login
     * @param loginDto 包含用户名和密码的对象
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    signIn(@Body() loginDto: LoginDto) {
        return this.authService.signIn(loginDto);
    }

    /**
     * 修改密码端点
     * POST /auth/change-password
     * @param req 请求对象，包含用户信息
     * @param changePasswordDto 包含新密码的对象
     */
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.sub, changePasswordDto);
    }

    /**
     * 用户登出端点
     * @param req 请求对象，包含用户信息
     */
    @UseGuards(JwtAuthGuard)
    @Get('logout')
    logout(@Request() req: any) {
        const token = req.headers.authorization.split(' ')[1];
        return this.authService.logout(token);
    }

    /**
     * 设置昵称端点
     * POST /auth/set-nickname
     * @param req 请求对象，包含用户信息
     * @param body 包含新昵称的对象
     */
    @UseGuards(JwtAuthGuard)
    @Post('set-nickname')
    @HttpCode(HttpStatus.OK)
    setNickname(@Request() req: any, @Body() body: { nickname: string }) {
        return this.authService.setNickname(req.user.sub, body.nickname);
    }

    /**
     * 获取当前用户信息
     * GET /auth/me
     * @param req 请求对象，包含用户信息
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req: any) {
        return {
            id: req.user.sub,
            username: req.user.username,
            role: req.user.role,
            nickname: req.user.nickname,
            avatar: req.user.avatar,
        };
    }

    /**
     * 上传头像接口
     * POST /auth/upload-avatar
     */
    @Post('upload-avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async uploadAvatar(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
                fileIsRequired: true,
            }),
        ) file: Express.Multer.File,
    ) {
        const url = `/static/${file.filename}`;
        return { url };
    }

    /**
     * 修改头像接口
     * POST /auth/set-avatar
     */
    @UseGuards(JwtAuthGuard)
    @Post('set-avatar')
    @HttpCode(HttpStatus.OK)
    setAvatar(@Request() req: any, @Body() body: { avatar: string }) {
        return this.authService.setAvatar(req.user.sub, body.avatar);
    }
}