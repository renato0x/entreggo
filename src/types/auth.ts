export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'deliverer' | 'admin';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface RegisterResponse {
    token: string;
    user: User;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface AuthError {
    message: string;
    field?: string;
}
