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

export interface WalletSummary {
    balance: number;
    totalEarnings: number;
    totalWithdrawals: number;
    monthlyEarnings: number;
    weeklyEarnings: number;
    updatedAt: Date;
}

export interface WalletTransaction {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    orderId?: string;
    withdrawalId?: string;
    withdrawalStatus?: WithdrawalStatus;
    balanceBefore?: number;
    balanceAfter?: number;
    createdAt: Date;
}

export interface Withdrawal {
    id: string;
    amount: number;
    status: WithdrawalStatus;
    requestedAt: Date;
    processedAt?: Date;
    bankAccount?: string;
    notes?: string;
}

export interface TransactionFilters {
    limit?: number;
    offset?: number;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

export interface WithdrawRequest {
    amount: number;
    bankAccount?: string;
    notes?: string;
}
