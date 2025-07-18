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
import { ShowcaseService } from '../showcase/showcase.service';
import { CreateCurioBoxDto } from './dto/create-curio-box.dto';
import { UpdateCurioBoxDto } from './dto/update-curio-box.dto';
import { UpdateItemsAndProbabilitiesDto } from './dto/update-items-and-probabilities.dto';
import { UpdateBoxCountDto } from './dto/update-box-count.dto';
import { QueryPostsDto } from '../showcase/dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiTags('CurioBox')
@Controller('curio-boxes') // 路由前缀统一为复数形式
export class CurioBoxController {
    constructor(
        private readonly curioBoxService: CurioBoxService,
        private readonly showcaseService: ShowcaseService,
    ) {}

    @ApiOperation({ summary: 'Get all posts under a specific curio box' })
    @ApiQuery({ name: 'sortBy', required: false, description: 'Sort order (e.g., latest)' })
    @ApiQuery({ name: 'order', required: false, description: 'Sort direction (ASC or DESC)' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'Returns a list of posts.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @Get(':id/posts')
    getPostsByCurioBoxId(
        @Param('id', ParseIntPipe) id: number,
        @Query() query: QueryPostsDto
    ) {
        return this.showcaseService.getPosts({ ...query, curioBoxId: id });
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new curio box with cover image (Admin only)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                category: { type: 'string' },
                itemIds: { type: 'array', items: { type: 'number' } },
                itemProbabilities: { type: 'array', items: { type: 'object', properties: { itemId: { type: 'number' }, probability: { type: 'number' } } } },
                coverImage: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Curio box created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
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
        return this.curioBoxService.createWithCover(file, createCurioBoxDto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new curio box (Admin only)' })
    @ApiBody({ type: CreateCurioBoxDto })
    @ApiResponse({ status: 201, description: 'Curio box created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() createCurioBoxDto: CreateCurioBoxDto) {
        return this.curioBoxService.create(createCurioBoxDto);
    }

    @ApiOperation({ summary: 'Search curio boxes by keyword' })
    @ApiQuery({ name: 'q', description: 'Search keyword' })
    @ApiResponse({ status: 200, description: 'Returns matching curio boxes.' })
    @Get('search')
    search(@Query('q') query: string) {
        return this.curioBoxService.search(query);
    }

    @ApiOperation({ summary: 'Get all curio boxes' })
    @ApiResponse({ status: 200, description: 'Returns a list of all curio boxes.' })
    @Get()
    findAll() {
        return this.curioBoxService.findAll();
    }

    @ApiOperation({ summary: 'Get a single curio box by ID' })
    @ApiResponse({ status: 200, description: 'Returns a single curio box.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.curioBoxService.findOne(id);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a curio box (Admin only)' })
    @ApiBody({ type: UpdateCurioBoxDto })
    @ApiResponse({ status: 200, description: 'Curio box updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCurioBoxDto: UpdateCurioBoxDto,
    ) {
        return this.curioBoxService.update(id, updateCurioBoxDto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a curio box (Admin only)' })
    @ApiResponse({ status: 200, description: 'Curio box deleted successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.curioBoxService.remove(id);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bulk update curio box items and probabilities (Admin only)' })
    @ApiResponse({ status: 200, description: 'Curio box items and probabilities updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @ApiBody({ type: UpdateItemsAndProbabilitiesDto })
    @Patch(':id/items-and-probabilities')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    updateItemsAndProbabilities(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateItemsAndProbabilitiesDto: UpdateItemsAndProbabilitiesDto,
    ) {
        return this.curioBoxService.updateItemsAndProbabilities(
            id,
            updateItemsAndProbabilitiesDto.itemIds ?? [],
            updateItemsAndProbabilitiesDto.itemProbabilities ?? [],
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update curio box count (Admin only)' })
    @ApiResponse({ status: 200, description: 'Curio box count updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Curio box not found.' })
    @ApiBody({ type: UpdateBoxCountDto })
    @Patch(':id/box-count')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    updateBoxCount(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBoxCountDto: UpdateBoxCountDto,
    ) {
        return this.curioBoxService.updateBoxCount(id, updateBoxCountDto.boxCount);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload image and return URL (Admin only)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Image uploaded successfully, returns URL.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
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
        return this.curioBoxService.uploadImage(file);
    }
}
