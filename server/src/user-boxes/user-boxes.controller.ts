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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

// 定义允许的 status 类型，便于维护和校验
type BoxStatusQuery = 'UNOPENED' | 'OPENED' | 'ALL';

@ApiTags('User Boxes')
@Controller()
@UseGuards(JwtAuthGuard)
export class UserBoxesController {
    constructor(private readonly userBoxesService: UserBoxesService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user\'s curio box list' })
    @ApiQuery({ name: 'status', enum: ['UNOPENED', 'OPENED', 'ALL'], required: false, description: 'Filter by box status (UNOPENED, OPENED, ALL). Defaults to UNOPENED.' })
    @ApiResponse({ status: 200, description: 'Returns a list of user\'s curio boxes.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
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

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Open one or more specified curio boxes' })
    @ApiResponse({ status: 200, description: 'Returns the results of opening the boxes.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @ApiResponse({ status: 400, description: 'Bad Request (e.g., box already opened).' })
    @Post('me/boxes/open')
    @HttpCode(200)
    async openBoxes(@Request() req, @Body() openBoxDto: OpenBoxDto) {
        return this.userBoxesService.openBoxes(req.user.sub, openBoxDto);
    }
}