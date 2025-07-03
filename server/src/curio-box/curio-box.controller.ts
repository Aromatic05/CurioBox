import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurioBoxService } from './curio-box.service';
import { CreateCurioBoxDto } from './dto/create-curio-box.dto';
import { UpdateCurioBoxDto } from './dto/update-curio-box.dto';

@Controller('curio-box')
export class CurioBoxController {
  constructor(private readonly curioBoxService: CurioBoxService) {}

  @Post()
  create(@Body() createCurioBoxDto: CreateCurioBoxDto) {
    return this.curioBoxService.create(createCurioBoxDto);
  }

  @Get()
  findAll() {
    return this.curioBoxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curioBoxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurioBoxDto: UpdateCurioBoxDto) {
    return this.curioBoxService.update(+id, updateCurioBoxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curioBoxService.remove(+id);
  }
}
