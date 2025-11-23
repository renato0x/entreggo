import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    driverId!: string;

    @OneToOne(() => Driver)
    @JoinColumn({ name: 'driverId' })
    driver!: Driver;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balance!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalEarnings!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalWithdrawals!: number;

    @OneToMany(() => WalletTransaction, transaction => transaction.wallet)
    transactions!: WalletTransaction[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
