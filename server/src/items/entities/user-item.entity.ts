import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Item } from './item.entity';

@Entity('user_item') // 建议明确指定表名
@Index(['userId', 'itemId'], { unique: true })
export class UserItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    itemId: number;

    @Column({ type: 'int', default: 1 })
    count: number;
    
    // --- 添加以下关系 ---
    @ManyToOne(() => User, user => user.userItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' }) // 告诉TypeORM 'userId' 列是外键
    user: User;

    @ManyToOne(() => Item, item => item.userItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'itemId' }) // 告诉TypeORM 'itemId' 列是外键
    item: Item;
}