import { apiClient } from './apiClient';
import { DeliveryHistoryItem, DeliveryStats, HistoryFilters } from '../types/history';

class HistoryService {
    /**
     * Get delivery history
     */
    async getHistory(filters?: HistoryFilters): Promise<{
        items: DeliveryHistoryItem[];
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
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
        if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
        if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
        if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

        const response = await apiClient.get(`/drivers/orders/history?${params.toString()}`);
        return {
            items: response.data.data,
            pagination: response.data.pagination,
        };
    }

    /**
     * Get delivery statistics
     */
    async getStats(): Promise<DeliveryStats> {
        const response = await apiClient.get('/drivers/orders/stats');
        return response.data.data;
    }
}

export default new HistoryService();
