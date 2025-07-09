import { CurioBox } from '../../curio-box/entities/curio-box.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

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

    @ManyToOne(() => CurioBox, (curioBox) => curioBox.items)
    @JoinColumn({ name: 'curioBoxId' })
    curioBox: CurioBox;
}