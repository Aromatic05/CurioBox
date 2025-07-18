import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Tag } from './tag.entity';
import { Comment } from './comment.entity';
import { CurioBox } from '../../curio-box/entities/curio-box.entity';
import { PostLike } from './post-like.entity';

@Entity('showcase_posts')
export class ShowcasePost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column('simple-array')
    images: string[];

    @Column()
    userId: number;

    @Column({ nullable: true })
    curioBoxId?: number;

    @ManyToOne(() => CurioBox, (curioBox) => curioBox.posts, { nullable: true })
    curioBox?: CurioBox;

    @ManyToOne(() => User)
    user: User;

    @Column({ default: 0 })
    likes: number;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    commentCount: number;

    @Column('float', { default: 0 })
    score: number;

    @Column('float', { default: 0 })
    hotScore: number;

    @ManyToMany(() => Tag)
    @JoinTable({
        name: 'post_tags',
        joinColumn: { name: 'postId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    })
    tags: Tag[];

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @OneToMany(() => PostLike, (like) => like.post)
    likesList: PostLike[];

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    lastActivityAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
