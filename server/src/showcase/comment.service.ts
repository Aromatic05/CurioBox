import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { ShowcasePost } from './entities/showcase-post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(ShowcasePost)
        private postRepository: Repository<ShowcasePost>,
    ) {}

    async createComment(
        userId: number,
        createCommentDto: CreateCommentDto,
    ): Promise<Comment> {
        const { content, postId, parentId } = createCommentDto;

        // 检查帖子是否存在
        const post = await this.postRepository.findOne({
            where: { id: postId },
        });

        if (!post) {
            throw new Error('Post not found');
        }

        // 如果有父评论，检查父评论是否存在
        if (parentId) {
            const parentComment = await this.commentRepository.findOne({
                where: { id: parentId },
            });
            if (!parentComment) {
                throw new Error('Parent comment not found');
            }
        }

        // 创建新评论
        const comment = this.commentRepository.create({
            content,
            postId,
            userId,
            parentId,
        });

        // 保存评论
        const savedComment = await this.commentRepository.save(comment);

        // 更新帖子评论数
        post.commentCount += 1;
        await this.postRepository.save(post);

        return savedComment;
    }

    async getComments(postId: number): Promise<Comment[]> {
        return await this.commentRepository.find({
            where: { postId },
            relations: ['user'],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async getReplies(commentId: number): Promise<Comment[]> {
        return await this.commentRepository.find({
            where: { parentId: commentId },
            relations: ['user'],
            order: {
                createdAt: 'ASC',
            },
        });
    }

    async deleteComment(
        id: number,
        userId: number,
        role: string,
    ): Promise<void> {
        const comment = await this.commentRepository.findOne({ where: { id } });
        if (!comment) {
            throw new Error('Comment not found');
        }
        // 只有评论所有者或管理员可删
        if (comment.userId !== userId && role !== 'admin') {
            throw new Error('Not authorized');
        }
        // 获取帖子
        const post = await this.postRepository.findOne({
            where: { id: comment.postId },
        });
        // 删除评论
        await this.commentRepository.remove(comment);
        // 更新帖子评论数
        if (post) {
            post.commentCount = Math.max(0, post.commentCount - 1);
            await this.postRepository.save(post);
        }
    }

    async updateComment(
        id: number,
        userId: number,
        content: string,
    ): Promise<Comment> {
        const comment = await this.commentRepository.findOne({ where: { id } });
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new Error('Not authorized');
        }
        comment.content = content;
        return await this.commentRepository.save(comment);
    }
}
