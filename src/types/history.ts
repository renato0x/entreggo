export interface DeliveryHistoryItem {
    id: string;
    establishmentName: string;
    establishmentAddress: string;
    deliveryAddress: string;
    amount: number;
    platformFee: number;
    driverEarnings: number;
    status: 'COMPLETED' | 'CANCELLED' | 'DISCARDED' | 'RETURNED';
    completedAt: Date;
    distance?: number;
    duration?: number;
    scoreGained?: number;
    rating?: number;
    pickupLocation?: {
        address: string;
        latitude: number;
        longitude: number;
    };
    deliveryLocation?: {
        address: string;
        latitude: number;
        longitude: number;
    };
}

export interface DeliveryStats {
    totalDeliveries: number;
    totalEarnings: number;
    totalDistance: number;
    averageRating: number;
    completionRate: number;
    monthlyDeliveries: number;
    weeklyDeliveries: number;
    monthlyEarnings: number;
    weeklyEarnings: number;
}

export interface HistoryFilters {
    limit?: number;
    offset?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    sortBy?: 'date' | 'amount';
    sortOrder?: 'ASC' | 'DESC';
}
