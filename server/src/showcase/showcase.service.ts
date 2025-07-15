import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowcasePost } from './entities/showcase-post.entity';
import { Tag } from './entities/tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto, SortBy, TimeRange } from './dto/query-posts.dto';

@Injectable()
export class ShowcaseService {
    async updatePost(id: number, userId: number, body: Partial<CreatePostDto>) {
        const post = await this.postRepository.findOne({ where: { id } });
        if (!post) {
            throw new Error('Post not found');
        }
        // 只有所有者才能修改
        if (post.userId !== userId) {
            throw new Error('Not authorized');
        }
        Object.assign(post, body);
        return await this.postRepository.save(post);
    }

    async deletePost(id: number, userId: number, role: string) {
        const post = await this.postRepository.findOne({ where: { id } });
        if (!post) {
            throw new Error('Post not found');
        }
        // 只有所有者或管理员才能删除
        if (post.userId !== userId && role !== 'admin') {
            throw new Error('Not authorized');
        }
        await this.postRepository.remove(post);
        return { message: 'Post deleted' };
    }
    constructor(
        @InjectRepository(ShowcasePost)
        private postRepository: Repository<ShowcasePost>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
    ) {}

    async createPost(
        userId: number,
        createPostDto: CreatePostDto,
    ): Promise<ShowcasePost> {
        const { title, content, images, tagIds } = createPostDto;

        // 创建新帖子
        const post = this.postRepository.create({
            title,
            content,
            images,
            userId,
        });

        // 如果有标签，关联标签
        if (tagIds && tagIds.length > 0) {
            const tags = await this.tagRepository.findByIds(tagIds);
            post.tags = tags;
        }

        // 保存帖子
        return await this.postRepository.save(post);
    }

    async getPosts(queryDto: QueryPostsDto & { userId?: number }) {
        const {
            sortBy = SortBy.LATEST,
            order = 'DESC',
            timeRange = TimeRange.ALL,
            tagIds,
            page = 1,
            pageSize = 20,
            userId,
            curioBoxId,
        } = queryDto;

        // 创建查询构建器
        const queryBuilder = this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.tags', 'tags');

        // 如果指定了时间范围
        if (timeRange !== TimeRange.ALL) {
            const startTime = this.getTimeRangeStart(timeRange);
            queryBuilder.where('post.createdAt >= :startTime', { startTime });
        }

        // 如果指定了标签
        if (tagIds && tagIds.length > 0) {
            queryBuilder
                .innerJoin('post.tags', 'tag')
                .where('tag.id IN (:...tagIds)', { tagIds });
        }

        // 如果指定了 userId
        if (userId) {
            queryBuilder.andWhere('post.userId = :userId', { userId });
        }

        // 如果指定了 curioBoxId
        if (curioBoxId) {
            queryBuilder.andWhere('post.curioBoxId = :curioBoxId', { curioBoxId });
        }

        // 应用排序
        switch (sortBy) {
            case SortBy.HOT:
                queryBuilder.orderBy('post.hotScore', order);
                break;
            case SortBy.COMPREHENSIVE:
                queryBuilder.orderBy('post.score', order);
                break;
            case SortBy.LATEST:
            default:
                queryBuilder.orderBy('post.createdAt', order);
        }

        // 应用分页
        const [posts, total] = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();

        return {
            items: posts,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async getPostById(id: number): Promise<ShowcasePost> {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['user', 'tags', 'comments', 'comments.user'],
        });

        if (!post) {
            throw new Error('Post not found');
        }

        // 增加浏览量
        post.views += 1;
        await this.postRepository.save(post);

        return post;
    }

    async updatePostHotScore(postId: number): Promise<void> {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['comments'],
        });

        if (!post) {
            return;
        }

        // 计算热度分数
        const now = new Date();
        const createdAt = new Date(post.createdAt);
        const timeDiff =
            (now.getTime() - createdAt.getTime()) / (24 * 3600 * 1000); // 天数差
        const timeDecayFactor = 1 / (1 + timeDiff);

        post.hotScore =
            (post.views * 1 + post.likes * 2 + post.commentCount * 3) *
            timeDecayFactor;

        await this.postRepository.save(post);
    }

    private getTimeRangeStart(timeRange: TimeRange): Date {
        const now = new Date();
        switch (timeRange) {
            case TimeRange.DAY:
                return new Date(now.setDate(now.getDate() - 1));
            case TimeRange.WEEK:
                return new Date(now.setDate(now.getDate() - 7));
            case TimeRange.MONTH:
                return new Date(now.setMonth(now.getMonth() - 1));
            default:
                return new Date(0);
        }
    }
}
