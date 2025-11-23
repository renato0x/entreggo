import { apiClient } from './apiClient';
import { Order } from '../types/store';

export interface AvailableOrdersParams {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
    minPrice?: number;
    maxPrice?: number;
    orderBy?: 'distance' | 'price' | 'createdAt';
}

export interface AcceptOrderRequest {
    orderId: string;
    estimatedPickupTime?: string;
}

export const orderService = {
    /**
     * Get available orders near location
     */
    async getAvailableOrders(params: AvailableOrdersParams): Promise<Order[]> {
        try {
            const response = await apiClient.get<Order[]>('/orders/available', {
                params: {
                    latitude: params.latitude,
                    longitude: params.longitude,
                    radius: params.radius || 10, // Default 10km
                    minPrice: params.minPrice,
                    maxPrice: params.maxPrice,
                    orderBy: params.orderBy || 'distance',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching available orders:', error);
            throw error;
        }
    },

    /**
     * Accept an order
     */
    async acceptOrder(data: AcceptOrderRequest): Promise<Order> {
        try {
            const response = await apiClient.post<Order>(`/orders/${data.orderId}/accept`, {
                estimatedPickupTime: data.estimatedPickupTime,
            });
            return response.data;
        } catch (error) {
            console.error('Error accepting order:', error);
            throw error;
        }
    },

    /**
     * Reject an order
     */
    async rejectOrder(orderId: string, reason?: string): Promise<void> {
        try {
            await apiClient.post(`/orders/${orderId}/reject`, {
                reason,
            });
        } catch (error) {
            console.error('Error rejecting order:', error);
            throw error;
        }
    },

    /**
     * Get order details
     */
    async getOrderDetails(orderId: string): Promise<Order> {
        try {
            const response = await apiClient.get<Order>(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },

    /**
     * Calculate distance between two points (Haversine formula)
     */
    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Radius of Earth in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Estimate delivery time based on distance
     */
    estimateDeliveryTime(distanceKm: number): number {
        // Assume average speed of 30 km/h in city
        const avgSpeedKmh = 30;
        const timeHours = distanceKm / avgSpeedKmh;
        return Math.ceil(timeHours * 60); // Return in minutes
    },
};
