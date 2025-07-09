import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShowcaseService } from './showcase.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Controller('showcase')
export class ShowcaseController {
  constructor(
    private readonly showcaseService: ShowcaseService,
  ) {}

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
}