import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
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
    constructor(private readonly curioBoxService: CurioBoxService) { }

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
            return cb(null, `${randomName}${extname(file.originalname)}`);
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
      ) file: Express.Multer.File,
      @Body() createCurioBoxDto: CreateCurioBoxDto,
    ) {
      console.log('Uploaded file:', file.filename);
      const coverImage = `/static/${file.filename}`;
      // 兼容 multipart/form-data 字段为字符串的情况
      const dto = { ...createCurioBoxDto };
      if (typeof dto.itemIds === 'string') {
        dto.itemIds = JSON.parse(dto.itemIds);
      }
      if (typeof dto.itemProbabilities === 'string') {
        dto.itemProbabilities = JSON.parse(dto.itemProbabilities);
      }
      const result = await this.curioBoxService.create({
        ...dto,
        coverImage,
      });
      return result;
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
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCurioBoxDto: UpdateCurioBoxDto) {
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
        @Body('itemProbabilities') itemProbabilities: { itemId: number; probability: number }[],
    ) {
        return this.curioBoxService.updateItemsAndProbabilities(id, itemIds, itemProbabilities);
    }
}