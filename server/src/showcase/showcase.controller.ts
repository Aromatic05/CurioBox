import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShowcaseService } from './showcase.service';
import { CommentService } from './comment.service';
import { TagService } from './tag.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Controller('showcase')
export class ShowcaseController {
    constructor(
        private readonly showcaseService: ShowcaseService,
        private readonly commentService: CommentService,
        private readonly tagService: TagService,
    ) { }

    // 帖子相关接口
    @Post('posts')
    @UseGuards(JwtAuthGuard)
    createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
        return this.showcaseService.createPost(req.user.sub, createPostDto);
    }

    @Get('posts')
    getPosts(@Query() queryDto: QueryPostsDto) {
        return this.showcaseService.getPosts(queryDto);
    }

    @Get('posts/:id')
    getPostById(@Param('id') id: string) {
        return this.showcaseService.getPostById(Number(id));
    }

    // 评论相关接口
    @Post('comments')
    @UseGuards(JwtAuthGuard)
    createComment(@Request() req, @Body() createCommentDto: CreateCommentDto) {
        return this.commentService.createComment(req.user.sub, createCommentDto);
    }

    @Get('posts/:postId/comments')
    getComments(@Param('postId') postId: string) {
        return this.commentService.getComments(Number(postId));
    }

    @Get('comments/:commentId/replies')
    getReplies(@Param('commentId') commentId: string) {
        return this.commentService.getReplies(Number(commentId));
    }

    @Put('comments/:id')
    @UseGuards(JwtAuthGuard)
    updateComment(
        @Request() req,
        @Param('id') id: string,
        @Body('content') content: string,
    ) {
        return this.commentService.updateComment(Number(id), req.user.sub, content);
    }

    @Delete('comments/:id')
    @UseGuards(JwtAuthGuard)
    deleteComment(@Request() req, @Param('id') id: string) {
        return this.commentService.deleteComment(Number(id), req.user.sub);
    }

    // 标签相关接口
    @Post('tags')
    @UseGuards(JwtAuthGuard)
    createTag(@Body() body: { name: string; description?: string }) {
        return this.tagService.createTag(body.name, body.description);
    }

    @Get('tags')
    getAllTags() {
        return this.tagService.getAllTags();
    }

    @Get('tags/hot')
    getHotTags(@Query('limit') limit?: number) {
        return this.tagService.getHotTags(limit);
    }

    @Get('tags/:id')
    getTagById(@Param('id') id: string) {
        return this.tagService.getTagById(Number(id));
    }

    @Put('tags/:id')
    @UseGuards(JwtAuthGuard)
    updateTag(
        @Param('id') id: string,
        @Body() body: { name?: string; description?: string },
    ) {
        return this.tagService.updateTag(Number(id), body.name, body.description);
    }

    @Delete('tags/:id')
    @UseGuards(JwtAuthGuard)
    deleteTag(@Param('id') id: string) {
        return this.tagService.deleteTag(Number(id));
    }
}