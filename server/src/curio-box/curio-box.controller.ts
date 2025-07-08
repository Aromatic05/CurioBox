import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CurioBoxService } from './curio-box.service';
import { CreateCurioBoxDto } from './dto/create-curio-box.dto';
import { UpdateCurioBoxDto } from './dto/update-curio-box.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('curio-boxes') // 路由前缀统一为复数形式
export class CurioBoxController {
    constructor(private readonly curioBoxService: CurioBoxService) { }

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
}