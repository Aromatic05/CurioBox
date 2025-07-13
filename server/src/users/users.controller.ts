import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    // 转为 number 类型
    return this.usersService.findPublicById(Number(id));
  }
}
