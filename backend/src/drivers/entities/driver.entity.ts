import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('drivers')
export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 20 })
    phone!: string;

    @Column({ type: 'varchar', length: 255, select: false })
    password!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'varchar', length: 50, default: 'pending' })
    status!: string; // pending, approved, rejected

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    reputation!: number;

    @Column({ type: 'int', default: 0 })
    totalDeliveries!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalEarnings!: number;

    @Column({ type: 'int', default: 0 })
    score!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
