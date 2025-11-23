import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('order_otps')
export class OrderOTP {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Order)
    order!: Order;

    @Column()
    orderId!: string;

    @Column({ type: 'varchar', length: 4 })
    code!: string;

    @Column({ type: 'timestamp' })
    expiresAt!: Date;

    @Column({ type: 'int', default: 0 })
    attempts!: number;

    @Column({ type: 'int', default: 3 })
    maxAttempts!: number;

    @Column({ type: 'boolean', default: false })
    isUsed!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
