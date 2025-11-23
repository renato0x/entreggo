import { TransactionType } from '../entities/wallet-transaction.entity';

export class GetTransactionsDto {
    limit?: number = 20;
    offset?: number = 0;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

export class WithdrawRequestDto {
    amount!: number;
    bankAccount?: string;
    notes?: string;
}

export class WalletSummaryDto {
    balance!: number;
    totalEarnings!: number;
    totalWithdrawals!: number;
    monthlyEarnings!: number;
    weeklyEarnings!: number;
    updatedAt!: Date;
}

export class TransactionResponseDto {
    id!: string;
    type!: TransactionType;
    amount!: number;
    description!: string;
    orderId?: string;
    withdrawalId?: string;
    withdrawalStatus?: string;
    balanceBefore?: number;
    balanceAfter?: number;
    createdAt!: Date;
}

export class WithdrawalResponseDto {
    id!: string;
    amount!: number;
    status!: string;
    requestedAt!: Date;
    processedAt?: Date;
    bankAccount?: string;
    notes?: string;
}
