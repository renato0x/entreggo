export class GetHistoryDto {
    limit?: number = 10;
    offset?: number = 0;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    sortBy?: 'date' | 'amount' = 'date';
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class DeliveryStatsDto {
    totalDeliveries!: number;
    totalEarnings!: number;
    averageRating!: number;
    completionRate!: number;
    monthlyDeliveries!: number;
    weeklyDeliveries!: number;
    monthlyEarnings!: number;
    weeklyEarnings!: number;
}

export class DeliveryHistoryItemDto {
    id!: string;
    establishmentName!: string;
    establishmentAddress!: string;
    deliveryAddress!: string;
    amount!: number;
    platformFee!: number;
    driverEarnings!: number;
    status!: string;
    completedAt!: Date;
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
