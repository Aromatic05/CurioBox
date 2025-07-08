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

    @Column({
        type: 'int',
        comment: '权重，用于抽奖算法，权重越大概率越高',
    })
    weight: number;

    @Column()
    curioBoxId: number;

    @ManyToOne(() => CurioBox, (curioBox) => curioBox.items)
    @JoinColumn({ name: 'curioBoxId' })
    curioBox: CurioBox;
}