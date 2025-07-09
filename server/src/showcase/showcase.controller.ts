import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShowcaseService } from './showcase.service';
import { CreateShowcaseDto } from './dto/create-showcase.dto';
import { UpdateShowcaseDto } from './dto/update-showcase.dto';

@Controller('showcase')
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  @Post()
  create(@Body() createShowcaseDto: CreateShowcaseDto) {
    return this.showcaseService.create(createShowcaseDto);
  }

  @Get()
  findAll() {
    return this.showcaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showcaseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShowcaseDto: UpdateShowcaseDto) {
    return this.showcaseService.update(+id, updateShowcaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.showcaseService.remove(+id);
  }
}
