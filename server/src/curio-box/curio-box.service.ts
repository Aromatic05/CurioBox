import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CurioBox } from './entities/curio-box.entity';
import { CreateCurioBoxDto } from './dto/create-curio-box.dto';
import { UpdateCurioBoxDto } from './dto/update-curio-box.dto';

@Injectable()
export class CurioBoxService {
  constructor(
    @InjectRepository(CurioBox)
    private readonly curioBoxRepository: Repository<CurioBox>,
  ) {}

  create(createCurioBoxDto: CreateCurioBoxDto): Promise<CurioBox> {
    const curioBox = this.curioBoxRepository.create(createCurioBoxDto);
    return this.curioBoxRepository.save(curioBox);
  }

  findAll(): Promise<CurioBox[]> {
    return this.curioBoxRepository.find();
  }

  async findOne(id: number): Promise<CurioBox> {
    const curioBox = await this.curioBoxRepository.findOne({ where: { id } });
    if (!curioBox) {
      throw new NotFoundException(`CurioBox with ID "${id}" not found`);
    }
    return curioBox;
  }

  async update(id: number, updateCurioBoxDto: UpdateCurioBoxDto): Promise<CurioBox> {
    const curioBox = await this.curioBoxRepository.preload({
      id: id,
      ...updateCurioBoxDto,
    });
    if (!curioBox) {
      throw new NotFoundException(`CurioBox with ID "${id}" not found`);
    }
    return this.curioBoxRepository.save(curioBox);
  }

  async remove(id: number): Promise<void> {
    const result = await this.curioBoxRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CurioBox with ID "${id}" not found`);
    }
  }
  
  search(query: string): Promise<CurioBox[]> {
    return this.curioBoxRepository.find({
      where: {
        name: Like(`%${query}%`),
      },
    });
  }
}