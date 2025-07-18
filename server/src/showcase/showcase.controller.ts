import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    Put,
    Delete,
    HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShowcaseService } from './showcase.service';
import { CommentService } from './comment.service';
import { TagService } from './tag.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Showcase')
@Controller('showcase')
export class ShowcaseController {
    constructor(
        private readonly showcaseService: ShowcaseService,
        private readonly commentService: CommentService,
        private readonly tagService: TagService,
    ) {}

    // 帖子相关接口
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiResponse({ status: 201, description: 'Post created successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @Post('posts')
    @UseGuards(JwtAuthGuard)
    createPost(
        @Request() req: { user: { sub: number | string } },
        @Body() createPostDto: CreatePostDto
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.showcaseService.createPost(userId, createPostDto);
    }

    @ApiOperation({ summary: 'Get a list of posts' })
    @ApiQuery({ name: 'sortBy', required: false, description: 'Sort order (e.g., latest)' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'Returns a list of posts.' })
    @Get('posts')
    getPosts(@Query() queryDto: QueryPostsDto) {
        return this.showcaseService.getPosts(queryDto);
    }

    @ApiOperation({ summary: 'Get a single post by ID' })
    @ApiResponse({ status: 200, description: 'Returns a single post.' })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    @Get('posts/:id')
    getPostById(@Param('id') id: string) {
        return this.showcaseService.getPostById(Number(id));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user\'s posts' })
    @ApiResponse({ status: 200, description: 'Returns a list of current user\'s posts.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @Get('me/posts')
    @UseGuards(JwtAuthGuard)
    async getMyPosts(@Request() req: { user: { sub: number | string } }) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.showcaseService.getPosts({
            userId,
            page: 1,
            pageSize: 20,
        });
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a post' })
    @ApiResponse({ status: 200, description: 'Post updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    @Put('posts/:id')
    @UseGuards(JwtAuthGuard)
    updatePost(
        @Request() req: { user: { sub: number | string } },
        @Param('id') id: string,
        @Body() body: Partial<CreatePostDto>,
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.showcaseService.updatePost(Number(id), userId, body);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a post' })
    @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    @Delete('posts/:id')
    @UseGuards(JwtAuthGuard)
    deletePost(
        @Request() req: { user: { sub: number | string; role?: string } },
        @Param('id') id: string
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        const userRole = req.user?.role ?? '';
        return this.showcaseService.deletePost(
            Number(id),
            userId,
            userRole,
        );
    }

    // 点赞相关接口
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Like a post' })
    @ApiResponse({ status: 200, description: 'Liked successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 400, description: 'Already liked.' })
    @HttpCode(200)
    @Post('posts/:id/like')
    @UseGuards(JwtAuthGuard)
    async likePost(
        @Request() req: { user: { sub: number | string } },
        @Param('id') id: string
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        const result = await this.showcaseService.likePost(Number(id), userId);
        // 显式返回200
        return { ...result };
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unlike a post' })
    @ApiResponse({ status: 200, description: 'Unliked successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 400, description: 'Not liked yet.' })
    @Delete('posts/:id/like')
    @UseGuards(JwtAuthGuard)
    async unlikePost(
        @Request() req: { user: { sub: number | string } },
        @Param('id') id: string
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.showcaseService.unlikePost(Number(id), userId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all posts liked by current user' })
    @ApiResponse({ status: 200, description: 'Returns a list of liked posts.' })
    @Get('me/liked-posts')
    @UseGuards(JwtAuthGuard)
    async getLikedPosts(@Request() req: { user: { sub: number | string } }) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.showcaseService.getLikedPostsByUser(userId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if current user liked the post' })
    @ApiResponse({ status: 200, description: 'Returns liked: true/false.' })
    @Get('posts/:id/liked')
    @UseGuards(JwtAuthGuard)
    async isPostLiked(
        @Request() req: { user: { sub: number | string } },
        @Param('id') id: string
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.showcaseService.isPostLikedByUser(Number(id), userId);
    }

    // 评论相关接口
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new comment or reply' })
    @ApiResponse({ status: 201, description: 'Comment created successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @Post('comments')
    @UseGuards(JwtAuthGuard)
    createComment(
        @Request() req: { user: { sub: number | string } },
        @Body() createCommentDto: CreateCommentDto
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.commentService.createComment(
            userId,
            createCommentDto,
        );
    }

    @ApiOperation({ summary: 'Get comments for a post' })
    @ApiResponse({ status: 200, description: 'Returns a list of comments for the specified post.' })
    @Get('posts/:postId/comments')
    getComments(@Param('postId') postId: string) {
        return this.commentService.getComments(Number(postId));
    }

    @ApiOperation({ summary: 'Get replies for a comment' })
    @ApiResponse({ status: 200, description: 'Returns a list of replies for the specified comment.' })
    @Get('comments/:commentId/replies')
    getReplies(@Param('commentId') commentId: string) {
        return this.commentService.getReplies(Number(commentId));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a comment' })
    @ApiResponse({ status: 200, description: 'Comment updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Comment not found.' })
    @ApiBody({ type: UpdateCommentDto })
    @Put('comments/:id')
    @UseGuards(JwtAuthGuard)
    updateComment(
        @Request() req: { user: { sub: number | string } },
        @Param('id') id: string,
        @Body() updateCommentDto: UpdateCommentDto,
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        return this.commentService.updateComment(
            Number(id),
            userId,
            updateCommentDto.content,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a comment' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Comment not found.' })
    @Delete('comments/:id')
    @UseGuards(JwtAuthGuard)
    deleteComment(
        @Request() req: { user: { sub: number | string; role?: string } },
        @Param('id') id: string
    ) {
        const userId = typeof req.user?.sub === 'number' ? req.user.sub : Number(req.user?.sub);
        const userRole = req.user?.role ?? '';
        return this.commentService.deleteComment(
            Number(id),
            userId,
            userRole,
        );
    }

    // 标签相关接口
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiResponse({ status: 201, description: 'Tag created successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ type: CreateTagDto })
    @Post('tags')
    @UseGuards(JwtAuthGuard)
    createTag(@Body() createTagDto: CreateTagDto) {
        return this.tagService.createTag(createTagDto.name, createTagDto.description);
    }

    @ApiOperation({ summary: 'Get all tags' })
    @ApiResponse({ status: 200, description: 'Returns a list of all tags.' })
    @Get('tags')
    getAllTags() {
        return this.tagService.getAllTags();
    }

    @ApiOperation({ summary: 'Get hot tags' })
    @ApiQuery({ name: 'limit', required: false, description: 'Limit the number of hot tags returned' })
    @ApiResponse({ status: 200, description: 'Returns a list of hot tags.' })
    @Get('tags/hot')
    getHotTags(@Query('limit') limit?: number) {
        return this.tagService.getHotTags(limit);
    }

    @ApiOperation({ summary: 'Get a tag by ID' })
    @ApiResponse({ status: 200, description: 'Returns a single tag.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    @Get('tags/:id')
    getTagById(@Param('id') id: string) {
        return this.tagService.getTagById(Number(id));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a tag' })
    @ApiResponse({ status: 200, description: 'Tag updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    @ApiBody({ type: UpdateTagDto })
    @Put('tags/:id')
    @UseGuards(JwtAuthGuard)
    updateTag(
        @Param('id') id: string,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.tagService.updateTag(
            Number(id),
            updateTagDto.name,
            updateTagDto.description,
        );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a tag' })
    @ApiResponse({ status: 200, description: 'Tag deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    @Delete('tags/:id')
    @UseGuards(JwtAuthGuard)
    deleteTag(@Param('id') id: string) {
        return this.tagService.deleteTag(Number(id));
    }
}
