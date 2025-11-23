import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
    DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
    DELIVERY_CANCELLED = 'DELIVERY_CANCELLED',
    WITHDRAWAL_REQUESTED = 'WITHDRAWAL_REQUESTED',
    WITHDRAWAL_PROCESSED = 'WITHDRAWAL_PROCESSED',
    WITHDRAWAL_CANCELLED = 'WITHDRAWAL_CANCELLED',
    REFUND = 'REFUND',
    BONUS = 'BONUS',
    PENALTY = 'PENALTY',
}

export enum WithdrawalStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    PROCESSED = 'PROCESSED',
    CANCELLED = 'CANCELLED',
}

@Entity('wallet_transactions')
export class WalletTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    walletId!: string;

    @ManyToOne(() => Wallet, wallet => wallet.transactions)
    @JoinColumn({ name: 'walletId' })
    wallet!: Wallet;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type!: TransactionType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'uuid', nullable: true })
    orderId?: string;

    @Column({ type: 'uuid', nullable: true })
    withdrawalId?: string;

    @Column({
        type: 'enum',
        enum: WithdrawalStatus,
        nullable: true,
    })
    withdrawalStatus?: WithdrawalStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    balanceBefore?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    balanceAfter?: number;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @CreateDateColumn()
    createdAt!: Date;
}
