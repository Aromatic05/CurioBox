import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { ShowcasePost } from './showcase-post.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    user: User;

    @Column()
    postId: number;

    @ManyToOne(() => ShowcasePost, post => post.comments)
    post: ShowcasePost;

    @Column({ nullable: true })
    parentId: number;

    @ManyToOne(() => Comment, { nullable: true })
    parent: Comment;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}