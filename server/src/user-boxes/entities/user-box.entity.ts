import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { CurioBox } from '../../curio-box/entities/curio-box.entity';
import { Item } from '../../items/entities/item.entity';

export enum UserBoxStatus {
    UNOPENED = 'unopened',
    OPENED = 'opened',
}

@Entity()
export class UserBox {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => CurioBox)
    @JoinColumn({ name: 'curioBoxId' })
    curioBox: CurioBox;

    @Column()
    curioBoxId: number;

    @Column({
        type: 'simple-enum',
        enum: UserBoxStatus,
        default: UserBoxStatus.UNOPENED,
        comment: '盲盒状态：未开启/已开启',
    })
    status: UserBoxStatus;

    @CreateDateColumn({ comment: '购买日期' })
    purchaseDate: Date;

    // 将抽中的物品在购买时就确定
    @ManyToOne(() => Item, { nullable: false })
    @JoinColumn({ name: 'itemId' })
    item: Item;

    @Column({ nullable: false })
    itemId: number;
}
