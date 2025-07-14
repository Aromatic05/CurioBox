import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
    HttpCode,
    Query,
    BadRequestException, // 导入 BadRequestException
} from '@nestjs/common';
import { UserBoxesService } from './user-boxes.service';
import { OpenBoxDto } from './dto/open-box.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// 定义允许的 status 类型，便于维护和校验
type BoxStatusQuery = 'UNOPENED' | 'OPENED' | 'ALL';

@Controller()
@UseGuards(JwtAuthGuard)
export class UserBoxesController {
    constructor(private readonly userBoxesService: UserBoxesService) {}

    /**
     * 获取当前用户的盲盒列表。
     * @param req - 包含用户信息的请求对象。
     * @param status - 查询参数，可以是 'UNOPENED', 'OPENED', 'ALL'。默认为 'UNOPENED'。
     */
    @Get('me/boxes')
    async getBoxes(
        @Request() req,
        @Query('status') status: BoxStatusQuery = 'UNOPENED', // 直接在这里设置默认值
    ) {
        // 在 Controller 层进行简单的输入验证
        const allowedStatuses: BoxStatusQuery[] = ['UNOPENED', 'OPENED', 'ALL'];
        if (!allowedStatuses.includes(status)) {
            throw new BadRequestException(
                `Invalid status value. Allowed values are: ${allowedStatuses.join(', ')}.`,
            );
        }

        // 调用统一的服务层方法
        const boxes = await this.userBoxesService.findUserBoxesByStatus(
            req.user.sub,
            status,
        );
        
        return { boxes };
    }

    /**
     * 开启一个或多个盲盒。
     * @param req - 包含用户信息的请求对象。
     * @param openBoxDto - 包含要开启的盲盒ID的DTO。
     */
    @Post('me/boxes/open')
    @HttpCode(200)
    async openBoxes(@Request() req, @Body() openBoxDto: OpenBoxDto) {
        return this.userBoxesService.openBoxes(req.user.sub, openBoxDto);
    }
}