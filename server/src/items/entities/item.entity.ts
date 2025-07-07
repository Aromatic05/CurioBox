import { CurioBox } from '../../curio-box/entities/curio-box.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

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

  // 定义与 CurioBox 的多对一关系
  @ManyToOne(() => CurioBox, (curioBox) => curioBox.items)
  curioBox: CurioBox;
}