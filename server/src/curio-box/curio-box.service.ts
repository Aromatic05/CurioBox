import { Injectable } from '@nestjs/common';
import { CreateCurioBoxDto } from './dto/create-curio-box.dto';
import { UpdateCurioBoxDto } from './dto/update-curio-box.dto';

@Injectable()
export class CurioBoxService {
  create(createCurioBoxDto: CreateCurioBoxDto) {
    return 'This action adds a new curioBox';
  }

  findAll() {
    return `This action returns all curioBox`;
  }

  findOne(id: number) {
    return `This action returns a #${id} curioBox`;
  }

  update(id: number, updateCurioBoxDto: UpdateCurioBoxDto) {
    return `This action updates a #${id} curioBox`;
  }

  remove(id: number) {
    return `This action removes a #${id} curioBox`;
  }
}
