import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity() // 标记这个类是一个实体
export class User {
  @PrimaryGeneratedColumn() // 标记为主键，并自动生成ID
  id: number;

  @Column({ unique: true }) // 标记为表的一列，并设置其值为唯一
  username: string;

  @Column({ select: false }) // 默认情况下，查询时不要返回这一列
  password?: string;

  @CreateDateColumn() // 自动设置为创建时的时间
  createdAt: Date;

  @UpdateDateColumn() // 自动设置为更新时的时间
  updatedAt: Date;
}