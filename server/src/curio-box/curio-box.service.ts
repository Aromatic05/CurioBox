import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { CurioBox } from './entities/curio-box.entity';
import { CreateCurioBoxDto } from './dto/create-curio-box.dto';
import { UpdateCurioBoxDto } from './dto/update-curio-box.dto';
import { Item } from '../items/entities/item.entity';
import { InjectRepository as InjectItemRepository } from '@nestjs/typeorm';

@Injectable()
export class CurioBoxService {
    constructor(
        @InjectRepository(CurioBox)
        private readonly curioBoxRepository: Repository<CurioBox>,
        @InjectItemRepository(Item)
        private readonly itemRepository: Repository<Item>,
    ) { }

    async create(createCurioBoxDto: CreateCurioBoxDto): Promise<CurioBox> {
        // 兼容 itemIds/itemProbabilities 可选
        const itemIds = createCurioBoxDto.itemIds ?? [];
        const itemProbabilities = createCurioBoxDto.itemProbabilities ?? [];
        if (itemIds.length > 0 || itemProbabilities.length > 0) {
            await this.validateItemProbabilities(itemProbabilities, itemIds);
            // 查出 items 实体数组
            const dbItems = await this.itemRepository.find({ where: { id: In(itemIds) } });
            if (dbItems.length !== itemIds.length) {
                throw new Error('部分 itemId 不存在');
            }
            const curioBox = this.curioBoxRepository.create({
                ...createCurioBoxDto,
                items: dbItems,
                itemProbabilities: itemProbabilities,
            });
            return this.curioBoxRepository.save(curioBox);
        } else {
            // 允许无 items/概率创建
            const curioBox = this.curioBoxRepository.create({
                ...createCurioBoxDto,
                items: [],
                itemProbabilities: [],
            });
            return this.curioBoxRepository.save(curioBox);
        }
    }

    // 校验 itemProbabilities
    private async validateItemProbabilities(itemProbabilities: { itemId: number; probability: number }[], items: Item[] | number[]) {
        if (!itemProbabilities || itemProbabilities.length === 0) {
            // 允许无概率时跳过校验
            return;
        }
        // 概率和为1
        const total = itemProbabilities.reduce((sum, i) => sum + i.probability, 0);
        if (Math.abs(total - 1) > 1e-6) {
            throw new Error('所有物品概率之和必须为1');
        }
        // itemId 不重复
        const idSet = new Set();
        for (const ip of itemProbabilities) {
            if (idSet.has(ip.itemId)) throw new Error('itemId 不能重复');
            idSet.add(ip.itemId);
        }
        // itemId 必须属于 items
        const itemIds = Array.isArray(items) ? items.map(i => typeof i === 'number' ? i : i.id) : [];
        for (const ip of itemProbabilities) {
            if (!itemIds.includes(ip.itemId)) {
                throw new Error(`itemId ${ip.itemId} 不属于本盲盒`);
            }
        }
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
        // 先查出当前 curioBox
        const oldCurioBox = await this.curioBoxRepository.findOne({ where: { id }, relations: ['items'] });
        if (!oldCurioBox) {
            throw new NotFoundException(`CurioBox with ID "${id}" not found`);
        }
        // items 和 itemProbabilities 兼容部分字段未传
        const itemIds = updateCurioBoxDto.itemIds ?? (oldCurioBox.items?.map(i => i.id) ?? []);
        const itemProbabilities = updateCurioBoxDto.itemProbabilities ?? oldCurioBox.itemProbabilities;
        await this.validateItemProbabilities(itemProbabilities, itemIds);
        // 查出 items 实体数组
        const dbItems = await this.itemRepository.find({ where: { id: In(itemIds) } });
        if (dbItems.length !== itemIds.length) {
            throw new Error('部分 itemId 不存在');
        }
        const curioBox = await this.curioBoxRepository.preload({
            id: id,
            ...updateCurioBoxDto,
            items: dbItems,
            itemProbabilities: itemProbabilities,
        });
        if (!curioBox) {
            throw new NotFoundException(`CurioBox with ID "${id}" not found`);
        }
        return this.curioBoxRepository.save(curioBox);
    }

    // 新增：修改items和概率列表的方法
    async updateItemsAndProbabilities(id: number, itemIds: number[], itemProbabilities: { itemId: number; probability: number }[]): Promise<CurioBox> {
        const curioBox = await this.curioBoxRepository.findOne({ where: { id }, relations: ['items'] });
        if (!curioBox) {
            throw new NotFoundException(`CurioBox with ID "${id}" not found`);
        }
        // 查询 items
        const dbItems = await this.itemRepository.find({ where: { id: In(itemIds) } });
        if (dbItems.length !== itemIds.length) {
            throw new Error('部分 itemId 不存在');
        }
        await this.validateItemProbabilities(itemProbabilities, dbItems);
        curioBox.items = dbItems;
        curioBox.itemProbabilities = itemProbabilities;
        return this.curioBoxRepository.save(curioBox);
    }

    async remove(id: number): Promise<void> {
        // 先查出当前 curioBox 及其 items
        const curioBox = await this.curioBoxRepository.findOne({ where: { id }, relations: ['items'] });
        if (!curioBox) {
            throw new NotFoundException(`CurioBox with ID "${id}" not found`);
        }
        // 解除所有 item 的关联（需重新查出每个 item 的 curioBoxes 关系）
        if (curioBox.items && curioBox.items.length > 0) {
            for (const item of curioBox.items) {
                // 查出 item 的 curioBoxes 关系，防止 curioBoxes 为 undefined
                const fullItem = await this.itemRepository.findOne({ where: { id: item.id }, relations: ['curioBoxes'] });
                if (fullItem) {
                    fullItem.curioBoxes = fullItem.curioBoxes?.filter(cb => cb.id !== id) || [];
                    await this.itemRepository.save(fullItem);
                }
            }
        }
        await this.curioBoxRepository.remove(curioBox);
    }

    search(query: string): Promise<CurioBox[]> {
        return this.curioBoxRepository.find({
            where: {
                name: Like(`%${query}%`),
            },
        });
    }

    // 上传图片并返回图片链接（不创建盲盒，仅返回图片URL）
    async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
        const url = `/static/${file.filename}`;
        return { url };
    }

    // 带图片创建盲盒（multipart/form-data）
    async createWithCover(file: Express.Multer.File, createCurioBoxDto: CreateCurioBoxDto): Promise<CurioBox> {
        const coverImage = `/static/${file.filename}`;
        // 兼容 multipart/form-data 字段为字符串的情况
        const dto = { ...createCurioBoxDto };
        if (typeof dto.itemIds === 'string') {
            dto.itemIds = JSON.parse(dto.itemIds);
        }
        if (typeof dto.itemProbabilities === 'string') {
            dto.itemProbabilities = JSON.parse(dto.itemProbabilities);
        }
        return this.create({
            ...dto,
            coverImage,
        });
    }
}