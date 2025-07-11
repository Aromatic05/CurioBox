import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowcasePost } from './entities/showcase-post.entity';
import { Tag } from './entities/tag.entity';
import { Comment } from './entities/comment.entity';
import { BlocklistedToken } from '../auth/entities/blocklisted-token.entity';
import { ShowcaseController } from './showcase.controller';
import { ShowcaseService } from './showcase.service';
import { TagService } from './tag.service';
import { CommentService } from './comment.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ShowcasePost,
            Tag,
            Comment,
            BlocklistedToken
        ]),
    ],
    controllers: [ShowcaseController],
    providers: [ShowcaseService, TagService, CommentService],
    exports: [ShowcaseService, TagService, CommentService],
})
export class ShowcaseModule { }