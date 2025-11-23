import { apiClient } from './apiClient';
import { Location } from '../types/store';

export interface LocationUpdate {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    speed?: number;
}

export const locationService = {
    /**
     * Send location update to backend
     */
    async updateLocation(location: LocationUpdate): Promise<void> {
        try {
            await apiClient.post('/drivers/location', {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                timestamp: location.timestamp,
                speed: location.speed || 0,
            });
        } catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    },

    /**
     * Batch update multiple locations
     */
    async batchUpdateLocations(locations: LocationUpdate[]): Promise<void> {
        try {
            await apiClient.post('/drivers/location/batch', {
                locations,
            });
        } catch (error) {
            console.error('Error batch updating locations:', error);
            throw error;
        }
    },

    /**
     * Get location history
     */
    async getLocationHistory(limit: number = 100): Promise<Location[]> {
        try {
            const response = await apiClient.get<Location[]>('/drivers/location/history', {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching location history:', error);
            throw error;
        }
    },
};
