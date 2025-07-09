import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
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

    // 新增：item和概率组成的列表
    @Column('json', { comment: '物品及其概率列表', nullable: false })
    itemProbabilities: { itemId: number; probability: number }[];

    @OneToMany(() => Item, (item) => item.curioBox)
    items: Item[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}