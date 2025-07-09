import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Item } from '../../items/entities/item.entity';

@Entity()
export class CurioBox {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column('decimal')
    price: number;

    @Column({ nullable: true })
    coverImage: string;

    @Column({ comment: '类别' })
    category: string;

    @Column('json', { comment: '物品及其概率列表', nullable: false })
    itemProbabilities: { itemId: number; probability: number }[];

    @ManyToMany(() => Item, (item) => item.curioBoxes)
    items: Item[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}