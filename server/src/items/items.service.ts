import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from './entities/item.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
    ) {}

    async create(createItemDto: CreateItemDto): Promise<Item> {
        const { name, image, category, stock, rarity, curioBoxIds } = createItemDto;
        let curioBoxes: CurioBox[] = [];
        if (curioBoxIds && curioBoxIds.length > 0) {
            curioBoxes = await this.curioBoxRepository.find({
                where: { id: In(curioBoxIds) },
            });
            if (curioBoxes.length !== curioBoxIds.length) {
                throw new NotFoundException('部分 CurioBox 不存在');
            }
        }
        const newItem = this.itemRepository.create({
            name,
            image,
            category,
            stock,
            rarity,
            curioBoxes,
        });
        return this.itemRepository.save(newItem);
    }

    async findAll(): Promise<Item[]> {
        return this.itemRepository.find({ relations: ['curioBoxes'] });
    }

    async findOne(id: number): Promise<Item> {
        const item = await this.itemRepository.findOne({
            where: { id },
            relations: ['curioBoxes'],
        });
        if (!item) {
            throw new NotFoundException(`Item with ID "${id}" not found.`);
        }
        return item;
    }

    async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
        const item = await this.itemRepository.findOne({
            where: { id },
            relations: ['curioBoxes'],
        });
        if (!item) {
            throw new NotFoundException(`Item with ID "${id}" not found.`);
        }
        // 支持多对多关系更新
        if (updateItemDto.curioBoxIds) {
            if (updateItemDto.curioBoxIds.length === 0) {
                item.curioBoxes = [];
            } else {
                const curioBoxes = await this.curioBoxRepository.find({
                    where: { id: In(updateItemDto.curioBoxIds) },
                });
                if (curioBoxes.length !== updateItemDto.curioBoxIds.length) {
                    throw new NotFoundException('部分 CurioBox 不存在');
                }
                item.curioBoxes = curioBoxes;
            }
        }
        Object.assign(item, { ...updateItemDto, curioBoxIds: undefined });
        return this.itemRepository.save(item);
    }

    async remove(id: number): Promise<void> {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID "${id}" not found.`);
        }
        await this.itemRepository.remove(item);
    }

    // 新增：修改库存数量
    async updateStock(id: number, stock: number): Promise<Item> {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID "${id}" not found.`);
        }
        item.stock = stock;
        return this.itemRepository.save(item);
    }
}
