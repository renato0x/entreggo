import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order_queue')
export class OrderQueue {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    orderId!: string;

    @Column()
    driverId!: string;

    @Column({ default: 'PENDING' })
    status!: string; // PENDING, REJECTED, EXPIRED

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
