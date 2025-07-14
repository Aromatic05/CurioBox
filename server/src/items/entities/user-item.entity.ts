import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['userId', 'itemId'], { unique: true })
export class UserItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    itemId: number;

    @Column({ type: 'int', default: 1 })
    count: number;
}
