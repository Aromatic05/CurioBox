import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
    ) {}

    async createTag(name: string, description?: string): Promise<Tag> {
        const existingTag = await this.tagRepository.findOne({
            where: { name },
        });

        if (existingTag) {
            throw new Error('Tag already exists');
        }

        const tag = this.tagRepository.create({
            name,
            description,
        });

        return await this.tagRepository.save(tag);
    }

    async getAllTags() {
        return await this.tagRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async getTagById(id: number): Promise<Tag> {
        const tag = await this.tagRepository.findOne({
            where: { id },
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        return tag;
    }

    async getTagsByIds(ids: number[]): Promise<Tag[]> {
        return await this.tagRepository.findByIds(ids);
    }

    async updateTag(
        id: number,
        name?: string,
        description?: string,
    ): Promise<Tag> {
        const tag = await this.tagRepository.findOne({
            where: { id },
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        if (name) {
            const existingTag = await this.tagRepository.findOne({
                where: { name },
            });

            if (existingTag && existingTag.id !== id) {
                throw new Error('Tag name already exists');
            }

            tag.name = name;
        }

        if (description !== undefined) {
            tag.description = description;
        }

        return await this.tagRepository.save(tag);
    }

    async deleteTag(id: number): Promise<void> {
        const tag = await this.tagRepository.findOne({
            where: { id },
        });

        if (!tag) {
            throw new Error('Tag not found');
        }

        await this.tagRepository.remove(tag);
    }

    async getHotTags(limit: number = 10): Promise<Tag[]> {
        // 这里可以根据标签的使用次数来排序
        // 需要和帖子表关联查询
        const tags = await this.tagRepository
            .createQueryBuilder('tag')
            .leftJoin('tag.posts', 'post')
            .select('tag.id', 'id')
            .addSelect('tag.name', 'name')
            .addSelect('COUNT(post.id)', 'usage')
            .groupBy('tag.id')
            .orderBy('usage', 'DESC')
            .limit(limit)
            .getRawMany();

        return tags;
    }
}
