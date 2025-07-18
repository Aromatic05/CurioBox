import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowcasePost } from './entities/showcase-post.entity';
import { Tag } from './entities/tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto, SortBy, TimeRange } from './dto/query-posts.dto';
import { PostLike } from './entities/post-like.entity';

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
        @InjectRepository(PostLike)
        private postLikeRepository: Repository<PostLike>,
    ) { }

    async createPost(
        userId: number,
        createPostDto: CreatePostDto,
    ): Promise<ShowcasePost> {
        const { title, content, images, tagIds, curioBoxId } = createPostDto;

        // 创建新帖子
        const post = this.postRepository.create({
            title,
            content,
            images,
            userId,
            curioBoxId
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
            page = 1,
            pageSize = 20,
            userId,
            curioBoxId,
        } = queryDto;
        let tagIds = queryDto.tagIds;

        // 强制 tagIds 为数组，防止 TypeORM IN 查询报错
        if (typeof tagIds === 'string' && tagIds) {
            tagIds = (tagIds as string).split(',').map(Number);
        } else if (typeof tagIds === 'number') {
            tagIds = [tagIds];
        } else if (!Array.isArray(tagIds)) {
            tagIds = [];
        }

        const queryBuilder = this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.tags', 'tags');

        // 统一用 andWhere，避免覆盖
        if (timeRange !== undefined && (timeRange as unknown) !== (TimeRange.ALL as unknown)) {
            const startTime = this.getTimeRangeStart(timeRange);
            queryBuilder.andWhere('post.createdAt >= :startTime', { startTime });
        }

        if (tagIds && tagIds.length > 0) {
            queryBuilder
                .innerJoin('post.tags', 'tag_filter', 'tag_filter.id IN (:...tagIds)', { tagIds });
        }

        if (userId) {
            queryBuilder.andWhere('post.userId = :userId', { userId });
        }

        if (curioBoxId) {
            queryBuilder.andWhere('post.curioBoxId = :curioBoxId', { curioBoxId });
        }

        // 排序逻辑
        const orderUpper = typeof order === 'string' ? order.toUpperCase() : '';
        const orderByValue = (orderUpper === 'ASC' || orderUpper === 'DESC') ? orderUpper : 'DESC';
        switch (sortBy) {
            case SortBy.HOT:
                queryBuilder.orderBy('post.hotScore', orderByValue);
                break;
            case SortBy.COMPREHENSIVE:
                queryBuilder.orderBy('post.score', orderByValue);
                break;
            case SortBy.LATEST:
            default:
                queryBuilder.orderBy('post.createdAt', orderByValue);
        }

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
    /**
     * 用户点赞帖子
     */
    async likePost(postId: number, userId: number) {
        // 检查是否已点赞
        const existed = await this.postLikeRepository.findOne({ where: { postId, userId } });
        if (existed) {
            throw new Error('You have already liked this post');
        }
        // 创建点赞
        await this.postLikeRepository.save({ postId, userId });
        // 更新帖子点赞数
        await this.postRepository.increment({ id: postId }, 'likes', 1);
        return { message: 'Liked successfully' };
    }

    /**
     * 用户取消点赞帖子
     */
    async unlikePost(postId: number, userId: number) {
        const existed = await this.postLikeRepository.findOne({ where: { postId, userId } });
        if (!existed) {
            throw new Error('You have not liked this post');
        }
        await this.postLikeRepository.remove(existed);
        await this.postRepository.decrement({ id: postId }, 'likes', 1);
        return { message: 'Unliked successfully' };
    }

    /**
     * 获取用户点赞过的所有帖子
     */
    async getLikedPostsByUser(userId: number) {
        const likes = await this.postLikeRepository.find({ where: { userId }, relations: ['post'] });
        return likes.map(like => like.post);
    }

    /**
     * 判断用户是否已点赞某帖子
     */
    async isPostLikedByUser(postId: number, userId: number): Promise<{ liked: boolean }> {
        const existed = await this.postLikeRepository.findOne({ where: { postId, userId } });
        return { liked: !!existed };
    }
}
