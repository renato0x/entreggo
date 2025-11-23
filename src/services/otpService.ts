import { apiClient } from './apiClient';
import { OTPGenerationResponse, OTPValidationRequest, OTPValidationResponse } from '../types/otp';
import { DeliveryDetails } from '../types/delivery';

class OTPServiceClass {
    /**
     * Start delivery and generate OTP
     */
    async startDelivery(orderId: string): Promise<{
        order: DeliveryDetails;
        otpCode: string;
        whatsappSent: boolean;
        expiresAt: Date;
    }> {
        try {
            const response = await apiClient.post(`/orders/${orderId}/start-delivery`);
            return {
                order: response.data.order,
                otpCode: response.data.otpCode,
                whatsappSent: response.data.whatsappSent,
                expiresAt: new Date(response.data.expiresAt),
            };
        } catch (error) {
            console.error('Error starting delivery:', error);
            throw error;
        }
    }

    /**
     * Validate OTP code
     */
    async validateOTP(data: OTPValidationRequest): Promise<OTPValidationResponse> {
        try {
            const response = await apiClient.post<OTPValidationResponse>(
                `/orders/${data.orderId}/validate-otp`,
                { code: data.code }
            );
            return response.data;
        } catch (error) {
            console.error('Error validating OTP:', error);
            throw error;
        }
    }

    /**
     * Resend OTP via WhatsApp
     */
    async resendOTP(orderId: string): Promise<boolean> {
        try {
            const response = await apiClient.post(`/orders/${orderId}/resend-otp`);
            return response.data.sent;
        } catch (error) {
            console.error('Error resending OTP:', error);
            return false;
        }
    }
}

export const otpService = new OTPServiceClass();
