import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/user.entity';
import { ShowcasePost } from './showcase-post.entity';

@Entity('post_likes')
@Unique(['userId', 'postId'])
export class PostLike {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    postId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => ShowcasePost, { onDelete: 'CASCADE' })
    post: ShowcasePost;
}
