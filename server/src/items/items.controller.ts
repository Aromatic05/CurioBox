import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    @Post()
    create(@Body() createItemDto: CreateItemDto) {
        return this.itemsService.create(createItemDto);
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
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
        ) file: Express.Multer.File,
        @Body() createItemDto: CreateItemDto,
    ) {
        const imageUrl = `/static/${file.filename}`;
        return this.itemsService.create({
            ...createItemDto,
            image: imageUrl,
        });
    }

    // 单独上传图片并返回图片链接（不创建物品，仅返回图片URL）
    @Post('upload-image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
                fileIsRequired: true,
            }),
        ) file: Express.Multer.File,
    ) {
        const url = `/static/${file.filename}`;
        return { url };
    }

    @Get()
    findAll() {
        return this.itemsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itemsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
        return this.itemsService.update(+id, updateItemDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itemsService.remove(+id);
    }

    @Patch(':id/stock')
    updateStock(@Param('id') id: string, @Body('stock') stock: number) {
        return this.itemsService.updateStock(+id, stock);
    }
}
