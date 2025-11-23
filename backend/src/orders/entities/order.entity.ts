import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 50 })
    status!: string; // PENDING, OFFERED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Column({ type: 'jsonb', nullable: true })
    pickupLocation!: {
        latitude: number;
        longitude: number;
        address: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    deliveryLocation!: {
        latitude: number;
        longitude: number;
        address: string;
    };

    @ManyToOne(() => Driver, { nullable: true })
    driver!: Driver;

    @Column({ nullable: true })
    driverId!: string;

    @Column({ type: 'timestamp', nullable: true })
    acceptedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    establishmentId!: string;

    @Column({ nullable: true })
    customerPhone!: string;

    @Column({ type: 'timestamp', nullable: true })
    completedAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
