import { apiClient } from './apiClient';
import { Category, DriverCategory } from '../types/store';

export const categoryService = {
    /**
     * Get all available categories
     */
    async getCategories(): Promise<Category[]> {
        try {
            const response = await apiClient.get<Category[]>('/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    /**
     * Get driver's categories
     */
    async getMyCategories(): Promise<DriverCategory[]> {
        try {
            const response = await apiClient.get<DriverCategory[]>('/driver-categories/me');
            return response.data;
        } catch (error) {
            console.error('Error fetching my categories:', error);
            throw error;
        }
    },

    /**
     * Apply for a category
     */
    async applyForCategory(categoryId: string): Promise<DriverCategory> {
        try {
            const response = await apiClient.post<DriverCategory>(`/driver-categories/apply/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error applying for category:', error);
            throw error;
        }
    },
};
