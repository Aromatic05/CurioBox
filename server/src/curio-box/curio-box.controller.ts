import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
} from '@nestjs/common';
import { CurioBoxService } from './curio-box.service';
import { CreateCurioBoxDto } from './dto/create-curio-box.dto';
import { UpdateCurioBoxDto } from './dto/update-curio-box.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('curio-boxes') // 路由前缀统一为复数形式
export class CurioBoxController {
    constructor(private readonly curioBoxService: CurioBoxService) {}

    @Post('upload')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @UseInterceptors(
        FileInterceptor('coverImage', {
            storage: diskStorage({
                destination: './uploads',
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
    async createWithCover(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
        @Body() createCurioBoxDto: CreateCurioBoxDto,
    ) {
        // 具体逻辑交给 service
        return this.curioBoxService.createWithCover(file, createCurioBoxDto);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() createCurioBoxDto: CreateCurioBoxDto) {
        return this.curioBoxService.create(createCurioBoxDto);
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.curioBoxService.search(query);
    }

    @Get()
    findAll() {
        return this.curioBoxService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.curioBoxService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCurioBoxDto: UpdateCurioBoxDto,
    ) {
        return this.curioBoxService.update(id, updateCurioBoxDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.curioBoxService.remove(id);
    }

    @Patch(':id/items-and-probabilities')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    updateItemsAndProbabilities(
        @Param('id', ParseIntPipe) id: number,
        @Body('itemIds') itemIds: number[],
        @Body('itemProbabilities')
        itemProbabilities: { itemId: number; probability: number }[],
    ) {
        return this.curioBoxService.updateItemsAndProbabilities(
            id,
            itemIds,
            itemProbabilities,
        );
    }

    /**
     * 修改盲盒数量
     * PATCH /curio-boxes/:id/box-count
     * body: { boxCount: number }
     */
    @Patch(':id/box-count')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    updateBoxCount(
        @Param('id', ParseIntPipe) id: number,
        @Body('boxCount') boxCount: number,
    ) {
        return this.curioBoxService.updateBoxCount(id, boxCount);
    }

    // 上传图片并返回图片链接（不创建盲盒，仅返回图片URL）
    @Post('upload-image')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
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
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        // 具体逻辑交给 service
        return this.curioBoxService.uploadImage(file);
    }
}
