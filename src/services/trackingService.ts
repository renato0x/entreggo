import { apiClient } from './apiClient';
import { DeliveryDetails, TrackingUpdate } from '../types/delivery';

class TrackingService {
    private trackingInterval: NodeJS.Timeout | null = null;
    private currentOrderId: string | null = null;

    /**
     * Start tracking for an active delivery
     */
    startTracking(orderId: string, onLocationUpdate: (lat: number, lng: number) => void) {
        this.currentOrderId = orderId;

        // Send location every 10 seconds
        this.trackingInterval = setInterval(async () => {
            try {
                // Location is obtained from the location service/hook
                // This will be called by the component with current location
            } catch (error) {
                console.error('Error in tracking interval:', error);
            }
        }, 10000);
    }

    /**
     * Stop tracking
     */
    stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
        this.currentOrderId = null;
    }

    /**
     * Send location update to backend
     */
    async sendLocationUpdate(data: TrackingUpdate): Promise<void> {
        try {
            await apiClient.post(`/orders/${data.orderId}/location`, {
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: data.timestamp,
                speed: data.speed,
                heading: data.heading,
            });
        } catch (error) {
            console.error('Error sending location update:', error);
            throw error;
        }
    }

    /**
     * Mark as arrived at pickup
     */
    async arrivedAtPickup(orderId: string): Promise<DeliveryDetails> {
        try {
            const response = await apiClient.post<DeliveryDetails>(
                `/orders/${orderId}/arrived-at-pickup`
            );
            return response.data;
        } catch (error) {
            console.error('Error marking arrived at pickup:', error);
            throw error;
        }
    }

    /**
     * Mark as picked up
     */
    async pickedUp(orderId: string): Promise<DeliveryDetails> {
        try {
            const response = await apiClient.post<DeliveryDetails>(
                `/orders/${orderId}/picked-up`
            );
            return response.data;
        } catch (error) {
            console.error('Error marking picked up:', error);
            throw error;
        }
    }

    /**
     * Mark as delivered
     */
    async delivered(orderId: string, proof?: string): Promise<DeliveryDetails> {
        try {
            const response = await apiClient.post<DeliveryDetails>(
                `/orders/${orderId}/delivered`,
                { proof }
            );
            return response.data;
        } catch (error) {
            console.error('Error marking delivered:', error);
            throw error;
        }
    }

    /**
     * Mark as arrived at destination
     */
    async arrivedAtDestination(orderId: string): Promise<DeliveryDetails> {
        try {
            const response = await apiClient.post<DeliveryDetails>(
                `/orders/${orderId}/arrived-at-destination`
            );
            return response.data;
        } catch (error) {
            console.error('Error marking arrived at destination:', error);
            throw error;
        }
    }

    /**
     * Cancel delivery
     */
    async cancelDelivery(orderId: string, reason: string): Promise<void> {
        try {
            await apiClient.post(`/orders/${orderId}/cancel`, { reason });
        } catch (error) {
            console.error('Error cancelling delivery:', error);
            throw error;
        }
    }

    /**
     * Get delivery details
     */
    async getDeliveryDetails(orderId: string): Promise<DeliveryDetails> {
        try {
            const response = await apiClient.get<DeliveryDetails>(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching delivery details:', error);
            throw error;
        }
    }
}

export const trackingService = new TrackingService();
