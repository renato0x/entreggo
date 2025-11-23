import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);
    private readonly evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    private readonly instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'entreggo';
    private readonly apiKey = process.env.EVOLUTION_API_KEY || '';

    /**
     * Send OTP code via WhatsApp
     */
    async sendOTPMessage(
        phoneNumber: string,
        otpCode: string,
        storeName: string,
        driverName: string,
    ): Promise<boolean> {
        try {
            // Format phone number (remove non-digits and add country code if needed)
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const message = `🚚 *Entreggo - Código de Confirmação*\n\n` +
                `Olá! Sua encomenda da *${storeName}* está a caminho com ${driverName}.\n\n` +
                `Para receber sua entrega, informe este código:\n\n` +
                `🔐 *${otpCode}*\n\n` +
                `⏰ Este código expira em 1 hora.\n\n` +
                `_Não compartilhe este código com ninguém além do entregador._`;

            const response = await axios.post(
                `${this.evolutionApiUrl}/message/sendText/${this.instanceName}`,
                {
                    number: formattedPhone,
                    text: message,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.apiKey,
                    },
                }
            );

            this.logger.log(`WhatsApp sent successfully to ${formattedPhone}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp: ${error.message}`);
            return false;
        }
    }

    /**
     * Format phone number for WhatsApp
     * Expected format: 5511999999999 (country code + area code + number)
     */
    private formatPhoneNumber(phone: string): string {
        // Remove all non-digits
        let cleaned = phone.replace(/\D/g, '');

        // Add Brazil country code if not present
        if (!cleaned.startsWith('55')) {
            cleaned = '55' + cleaned;
        }

        return cleaned;
    }

    /**
     * Check if WhatsApp instance is connected
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await axios.get(
                `${this.evolutionApiUrl}/instance/connectionState/${this.instanceName}`,
                {
                    headers: {
                        'apikey': this.apiKey,
                    },
                }
            );

            return response.data?.state === 'open';
        } catch (error) {
            this.logger.error(`Failed to check WhatsApp connection: ${error.message}`);
            return false;
        }
    }
}
