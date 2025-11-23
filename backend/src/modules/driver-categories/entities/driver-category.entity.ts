import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from '../../../drivers/entities/driver.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('driver_categories')
export class DriverCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'driver_id' })
    driverId: string;

    @ManyToOne(() => Driver)
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @Column({ name: 'category_id' })
    categoryId: string;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({
        type: 'enum',
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    })
    status: 'pending' | 'approved' | 'rejected';

    @Column({ name: 'verified_at', nullable: true })
    verifiedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
