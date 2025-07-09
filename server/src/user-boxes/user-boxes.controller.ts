import { Controller, Get, Post, Body, UseGuards, Request, HttpCode, Query } from '@nestjs/common';
import { UserBoxesService } from './user-boxes.service';
import { CreateUserBoxDto } from './dto/create-user-box.dto';
import { OpenBoxDto } from './dto/open-box.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserBoxesController {
    constructor(private readonly userBoxesService: UserBoxesService) {}

    // 获取用户的盲盒列表（支持 status 查询参数，支持 all）
    @Get('me/boxes')
    async getBoxes(@Request() req, @Query('status') status: string) {
        let boxes;
        if (status === 'OPENED') {
            boxes = await this.userBoxesService.findUserBoxesByStatus(req.user.id, 'OPENED');
        } else if (status === 'ALL' || status === 'all') {
            boxes = await this.userBoxesService.findAllUserBoxes(req.user.id);
        } else {
            // 默认返回未开启
            boxes = await this.userBoxesService.findUserBoxesByStatus(req.user.id, 'UNOPENED');
        }
        return { boxes };
    }

    // 开启盲盒
    @Post('me/boxes/open')
    @HttpCode(200) // 确保返回200状态码而不是默认的201
    async openBoxes(@Request() req, @Body() openBoxDto: OpenBoxDto) {
        return this.userBoxesService.openBoxes(req.user.id, openBoxDto);
    }
}