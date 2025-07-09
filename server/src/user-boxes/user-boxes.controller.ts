import { Controller, Get, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { UserBoxesService } from './user-boxes.service';
import { CreateUserBoxDto } from './dto/create-user-box.dto';
import { OpenBoxDto } from './dto/open-box.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserBoxesController {
    constructor(private readonly userBoxesService: UserBoxesService) {}

    // 获取用户的盲盒列表
    @Get('me/boxes')
    async getUno(@Request() req) {
        return {
            boxes: await this.userBoxesService.findUserUnopenedBoxes(req.user.id)
        };
    }

    // 开启盲盒
    @Post('me/boxes/open')
    @HttpCode(200) // 确保返回200状态码而不是默认的201
    async openBoxes(@Request() req, @Body() openBoxDto: OpenBoxDto) {
        return this.userBoxesService.openBoxes(req.user.id, openBoxDto);
    }
}