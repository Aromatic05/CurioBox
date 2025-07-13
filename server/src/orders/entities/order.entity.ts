import { CurioBox } from '../../curio-box/entities/curio-box.entity';
import { Item } from '../../items/entities/item.entity';
import { User } from '../../users/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

export enum OrderStatus {
    COMPLETED = 'completed',
    PENDING = 'pending',
    CANCELLED = 'cancelled',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal')
    price: number; // 订单价格

    @Column({
        type: 'simple-enum',
        enum: OrderStatus,
        default: OrderStatus.COMPLETED,
    })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;

    // 关联下单用户
    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    // 关联购买的盲盒
    @ManyToOne(() => CurioBox)
    @JoinColumn({ name: 'curioBoxId' })
    curioBox: CurioBox;

    @Column()
    curioBoxId: number;

    // 关联抽中的物品
    @ManyToOne(() => Item)
    @JoinColumn({ name: 'drawnItemId' })
    drawnItem: Item;

    @Column({ nullable: true })
    drawnItemId: number;
}
