export interface OTPCode {
    id: string;
    orderId: string;
    code: string;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    isUsed: boolean;
    createdAt: Date;
}

export interface OTPGenerationResponse {
    code: string;
    expiresAt: Date;
    whatsappSent: boolean;
}

export interface OTPValidationRequest {
    orderId: string;
    code: string;
}

export interface OTPValidationResponse {
    valid: boolean;
    message: string;
    attemptsRemaining?: number;
}
