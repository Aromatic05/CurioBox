import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UserBoxesService } from './user-boxes.service';
import { OpenBoxDto } from './dto/open-box.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserBoxesController {
    constructor(private readonly userBoxesService: UserBoxesService) {}

    // 获取用户的盲盒列表
    @Get('user-boxes')
    findAll(@Request() req) {
        const userId = req.user.id || req.user.sub;
        return this.userBoxesService.findUserUnopenedBoxes(userId);
    }

    // 开盲盒
    @Post('user-boxes/open')
    async openBox(@Body() openBoxDto: OpenBoxDto, @Request() req) {
        const userId = req.user.id || req.user.sub;
        return this.userBoxesService.openBoxes(userId, openBoxDto);
    }
}