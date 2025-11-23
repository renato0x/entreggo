import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, MoreThanOrEqual, Between } from 'typeorm';
import { Order } from './entities/order.entity';
import { GetHistoryDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    /**
     * Get delivery history with filters and pagination
     */
    async getDeliveryHistory(driverId: string, filters: GetHistoryDto) {
        const queryBuilder = this.entityManager
            .createQueryBuilder(Order, 'order')
            // .leftJoinAndSelect('order.establishment', 'establishment')
            .where('order.driverId = :driverId', { driverId })
            .andWhere('order.status IN (:...statuses)', {
                statuses: ['COMPLETED', 'CANCELLED', 'DISCARDED', 'RETURNED'],
            });

        // Apply filters
        if (filters.status) {
            queryBuilder.andWhere('order.status = :status', { status: filters.status });
        }

        if (filters.startDate && filters.endDate) {
            queryBuilder.andWhere('order.completedAt BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        } else if (filters.startDate) {
            queryBuilder.andWhere('order.completedAt >= :startDate', {
                startDate: filters.startDate,
            });
        } else if (filters.endDate) {
            queryBuilder.andWhere('order.completedAt <= :endDate', {
                endDate: filters.endDate,
            });
        }

        if (filters.minAmount !== undefined) {
            queryBuilder.andWhere('order.price >= :minAmount', {
                minAmount: filters.minAmount,
            });
        }

        if (filters.maxAmount !== undefined) {
            queryBuilder.andWhere('order.price <= :maxAmount', {
                maxAmount: filters.maxAmount,
            });
        }

        if (filters.search) {
            queryBuilder.andWhere(
                '(establishment.name ILIKE :search OR order.deliveryAddress ILIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Sorting
        const sortField = filters.sortBy === 'amount' ? 'order.price' : 'order.completedAt';
        queryBuilder.orderBy(sortField, filters.sortOrder || 'DESC');

        // Pagination
        const limit = filters.limit || 10;
        const offset = filters.offset || 0;

        const [orders, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        // Transform to DTOs
        const items = orders.map(order => this.transformToHistoryItem(order));

        return {
            items,
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };
    }

    /**
     * Get delivery statistics
     */
    async getDeliveryStats(driverId: string) {
        // Total deliveries and earnings
        const allDeliveries = await this.entityManager.find(Order, {
            where: {
                driverId,
                status: 'COMPLETED' as any,
            },
        });

        const totalDeliveries = allDeliveries.length;
        const totalEarnings = allDeliveries.reduce(
            (sum, order) => sum + Number(order.price),
            0
        );

        // Calculate average rating
        const ordersWithRating = allDeliveries.filter(o => (o as any).rating);
        const averageRating = ordersWithRating.length > 0
            ? ordersWithRating.reduce((sum, o) => sum + Number((o as any).rating), 0) / ordersWithRating.length
            : 0;

        // Calculate completion rate
        const allOrders = await this.entityManager.count(Order, {
            where: { driverId },
        });
        const completionRate = allOrders > 0 ? (totalDeliveries / allOrders) * 100 : 0;

        // Monthly deliveries and earnings
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyDeliveries = await this.entityManager.find(Order, {
            where: {
                driverId,
                status: 'COMPLETED' as any,
                completedAt: MoreThanOrEqual(startOfMonth) as any,
            },
        });

        const monthlyCount = monthlyDeliveries.length;
        const monthlyEarnings = monthlyDeliveries.reduce(
            (sum, order) => sum + Number(order.price),
            0
        );

        // Weekly deliveries and earnings
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyDeliveries = await this.entityManager.find(Order, {
            where: {
                driverId,
                status: 'COMPLETED' as any,
                completedAt: MoreThanOrEqual(startOfWeek) as any,
            },
        });

        const weeklyCount = weeklyDeliveries.length;
        const weeklyEarnings = weeklyDeliveries.reduce(
            (sum, order) => sum + Number(order.price),
            0
        );

        return {
            totalDeliveries,
            totalEarnings,
            averageRating,
            completionRate,
            monthlyDeliveries: monthlyCount,
            weeklyDeliveries: weeklyCount,
            monthlyEarnings,
            weeklyEarnings,
        };
    }

    /**
     * Transform order to history item DTO
     */
    private transformToHistoryItem(order: Order) {
        const platformFee = Number(order.price) * 0.15; // 15% platform fee
        const driverEarnings = Number(order.price) - platformFee;

        return {
            id: order.id,
            establishmentName: 'Estabelecimento', // Placeholder until Establishment entity is linked
            establishmentAddress: order.pickupLocation?.address || '',
            deliveryAddress: order.deliveryLocation?.address || '',
            amount: Number(order.price),
            platformFee,
            driverEarnings,
            status: order.status,
            completedAt: order.completedAt,
            distance: 0, // Placeholder
            duration: 0, // Placeholder
            scoreGained: 1, // Placeholder
            rating: undefined, // Placeholder
            pickupLocation: order.pickupLocation,
            deliveryLocation: order.deliveryLocation,
        };
    }
}
