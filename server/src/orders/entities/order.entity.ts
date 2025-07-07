import { CurioBox } from '../../curio-box/entities/curio-box.entity';
import { Item } from '../../items/entities/item.entity';
import { User } from '../../users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

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
  user: User;
  
  // 关联购买的盲盒
  @ManyToOne(() => CurioBox)
  curioBox: CurioBox;
  
  // 关联抽中的物品
  @ManyToOne(() => Item)
  drawnItem: Item;
}