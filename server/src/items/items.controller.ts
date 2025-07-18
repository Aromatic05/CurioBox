import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { extname } from 'path';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ENTRYDIR } from '../constants';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new item (Admin only)' })
    @ApiResponse({ status: 201, description: 'Item created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @Post()
    create(@Body() createItemDto: CreateItemDto) {
        return this.itemsService.create(createItemDto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new item with image upload (Admin only)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                category: { type: 'string' },
                stock: { type: 'number' },
                rarity: { type: 'string' },
                curioBoxIds: { type: 'array', items: { type: 'number' } },
                image: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Item created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: path.join(ENTRYDIR, 'uploads'),
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
    async uploadItem(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
        @Body() createItemDto: CreateItemDto,
    ) {
        const imageUrl = `/static/${file.filename}`;
        return this.itemsService.create({
            ...createItemDto,
            image: imageUrl,
        });
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
    @Post('upload-image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: path.join(ENTRYDIR, 'uploads'),
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
    uploadImage(
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
        const url = `/static/${file.filename}`;
        return { url };
    }

    @ApiOperation({ summary: 'Get all items' })
    @ApiResponse({ status: 200, description: 'Returns a list of all items.' })
    @Get()
    findAll() {
        return this.itemsService.findAll();
    }

    @ApiOperation({ summary: 'Get a single item by ID' })
    @ApiResponse({ status: 200, description: 'Returns a single item.' })
    @ApiResponse({ status: 404, description: 'Item not found.' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itemsService.findOne(+id);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an item (Admin only)' })
    @ApiResponse({ status: 200, description: 'Item updated successfully.' })
    @ApiResponse({ status: 404, description: 'Item not found.' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
        return this.itemsService.update(+id, updateItemDto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an item (Admin only)' })
    @ApiResponse({ status: 200, description: 'Item deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Item not found.' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itemsService.remove(+id);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update item stock (Admin only)' })
    @ApiResponse({ status: 200, description: 'Item stock updated successfully.' })
    @ApiResponse({ status: 404, description: 'Item not found.' })
    @ApiBody({ type: UpdateStockDto })
    @Patch(':id/stock')
    updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
        return this.itemsService.updateStock(+id, updateStockDto.stock);
    }
}
