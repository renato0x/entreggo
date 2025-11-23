import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderOTP } from './entities/order-otp.entity';
import { randomInt } from 'crypto';

@Injectable()
export class OTPService {
    constructor(
        @InjectRepository(OrderOTP)
        private otpRepository: Repository<OrderOTP>,
    ) { }

    /**
     * Generate a new 4-digit OTP code
     */
    async generateOTP(orderId: string): Promise<OrderOTP> {
        // Generate random 4-digit code
        const code = randomInt(1000, 9999).toString();

        // Set expiration to 1 hour from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Invalidate any existing OTPs for this order
        await this.otpRepository.update(
            { orderId, isUsed: false },
            { isUsed: true }
        );

        // Create new OTP
        const otp = this.otpRepository.create({
            orderId,
            code,
            expiresAt,
            attempts: 0,
            maxAttempts: 3,
            isUsed: false,
        });

        return await this.otpRepository.save(otp);
    }

    /**
     * Validate OTP code
     */
    async validateOTP(orderId: string, code: string): Promise<{ valid: boolean; message: string; attemptsRemaining?: number }> {
        const otp = await this.otpRepository.findOne({
            where: { orderId, isUsed: false },
            order: { createdAt: 'DESC' },
        });

        if (!otp) {
            return {
                valid: false,
                message: 'Código não encontrado ou já utilizado.',
            };
        }

        // Check if expired
        if (new Date() > otp.expiresAt) {
            return {
                valid: false,
                message: 'Código expirado. Solicite um novo código.',
            };
        }

        // Check if max attempts reached
        if (otp.attempts >= otp.maxAttempts) {
            return {
                valid: false,
                message: 'Número máximo de tentativas excedido. Solicite um novo código.',
            };
        }

        // Validate code
        if (otp.code !== code) {
            // Increment attempts
            otp.attempts += 1;
            await this.otpRepository.save(otp);

            const attemptsRemaining = otp.maxAttempts - otp.attempts;
            return {
                valid: false,
                message: `Código incorreto. ${attemptsRemaining} tentativa(s) restante(s).`,
                attemptsRemaining,
            };
        }

        // Mark as used
        otp.isUsed = true;
        await this.otpRepository.save(otp);

        return {
            valid: true,
            message: 'Código validado com sucesso!',
        };
    }

    /**
     * Get active OTP for order
     */
    async getActiveOTP(orderId: string): Promise<OrderOTP | null> {
        return await this.otpRepository.findOne({
            where: { orderId, isUsed: false },
            order: { createdAt: 'DESC' },
        });
    }
}
