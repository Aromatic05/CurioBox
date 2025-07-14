import { CurioBox } from '../../curio-box/entities/curio-box.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { OneToMany } from 'typeorm';
import { UserItem } from './user-item.entity';

@Entity()
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    image: string;

    @Column({ comment: '物品类别' })
    category: string;

    @Column({ type: 'int', comment: '库存数量' })
    stock: number;

    @Column({ comment: '稀有度' })
    rarity: string;

    @ManyToMany(() => CurioBox, (curioBox) => curioBox.items)
    @JoinTable({ name: 'item_curio_boxes' })
    curioBoxes: CurioBox[];

    @OneToMany(() => UserItem, userItem => userItem.item)
    userItems: UserItem[];
}
