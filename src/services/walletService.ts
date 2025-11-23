import apiClient from './apiClient';
import { WalletSummary, WalletTransaction, Withdrawal, TransactionFilters, WithdrawRequest } from '../types/wallet';

class WalletService {
    /**
     * Get wallet summary
     */
    async getWalletSummary(): Promise<WalletSummary> {
        const response = await apiClient.get('/drivers/wallet');
        return response.data.data;
    }

    /**
     * Get transaction history
     */
    async getTransactions(filters?: TransactionFilters): Promise<{
        transactions: WalletTransaction[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }> {
        const params = new URLSearchParams();

        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());
        if (filters?.type) params.append('type', filters.type);
        if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
        if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
        if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
        if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
        if (filters?.search) params.append('search', filters.search);

        const response = await apiClient.get(`/drivers/wallet/transactions?${params.toString()}`);
        return {
            transactions: response.data.data,
            pagination: response.data.pagination,
        };
    }

    /**
     * Request withdrawal
     */
    async requestWithdrawal(request: WithdrawRequest): Promise<Withdrawal> {
        const response = await apiClient.post('/drivers/wallet/withdraw', request);
        return response.data.data;
    }

    /**
     * Get withdrawal history
     */
    async getWithdrawals(): Promise<Withdrawal[]> {
        const response = await apiClient.get('/drivers/wallet/withdrawals');
        return response.data.data;
    }
}

export default new WalletService();
