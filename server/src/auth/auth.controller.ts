import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // 这个控制器下的所有路由都会以 /auth 开头
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册端点
   * POST /auth/register
   */
  @Post('register')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  /**
   * 用户登录端点
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // 默认POST是201, 登录成功我们返回200 OK
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }
}