import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}