import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
    ) { }

    async create(createItemDto: CreateItemDto): Promise<Item> {
        console.log('CreateItemDto:', createItemDto);
        const { name, image, weight, curioBoxId } = createItemDto;
        const curioBox = await this.curioBoxRepository.findOne({ where: { id: curioBoxId } });
        if (!curioBox) {
            console.error(`CurioBox with ID "${curioBoxId}" not found.`);
            throw new NotFoundException(`CurioBox with ID "${curioBoxId}" not found.`);
        }
        const newItem = this.itemRepository.create({
            name,
            image,
            weight,
            curioBoxId,
            curioBox,
        });
        try {
            const saved = await this.itemRepository.save(newItem);
            console.log('Saved Item:', saved);
            return saved;
        } catch (err) {
            console.error('Error saving item:', err);
            throw err;
        }
    }

    async findAll(): Promise<Item[]> {
        return this.itemRepository.find({ relations: ['curioBox'] });
    }

    async findOne(id: number): Promise<Item> {
        const item = await this.itemRepository.findOne({ where: { id }, relations: ['curioBox'] });
        if (!item) {
            throw new NotFoundException(`Item with ID "${id}" not found.`);
        }
        return item;
    }

    async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID "${id}" not found.`);
        }
        Object.assign(item, updateItemDto);
        return this.itemRepository.save(item);
    }

    async remove(id: number): Promise<void> {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID "${id}" not found.`);
        }
        await this.itemRepository.remove(item);
    }
}
