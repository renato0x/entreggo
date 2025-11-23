import { apiClient } from './apiClient';
import {
    DriverProfile,
    UpdateProfileRequest,
    UploadDocumentRequest,
    UploadDocumentResponse,
} from '../types/profile';

export const profileService = {
    /**
     * Get driver profile
     */
    async getProfile(): Promise<DriverProfile> {
        const response = await apiClient.get<DriverProfile>('/drivers/profile');
        return response.data;
    },

    /**
     * Update driver profile
     */
    async updateProfile(data: UpdateProfileRequest): Promise<DriverProfile> {
        const response = await apiClient.put<DriverProfile>('/drivers/profile', data);
        return response.data;
    },

    /**
     * Upload document
     */
    async uploadDocument(data: UploadDocumentRequest): Promise<UploadDocumentResponse> {
        const formData = new FormData();
        formData.append('documentType', data.documentType);
        formData.append('file', {
            uri: data.file.uri,
            name: data.file.name,
            type: data.file.type,
        } as any);

        const response = await apiClient.post<UploadDocumentResponse>(
            '/drivers/documents',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    /**
     * Get approval status
     */
    async getApprovalStatus(): Promise<{
        status: string;
        cnhStatus: string;
        vehicleStatus: string;
        rejectionReasons?: {
            cnh?: string;
            vehicle?: string;
        };
    }> {
        const response = await apiClient.get('/drivers/approval-status');
        return response.data;
    },

    /**
     * Delete document
     */
    async deleteDocument(documentType: string): Promise<void> {
        await apiClient.delete(`/drivers/documents/${documentType}`);
    },
};
