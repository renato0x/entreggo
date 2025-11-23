import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    User,
} from '../types/auth';

const TOKEN_KEY = '@entreggo:token';
const USER_KEY = '@entreggo:user';

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);

        // Store token and user data
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

        return response.data;
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        try {
            const response = await apiClient.post<RegisterResponse>('/auth/register', data);

            // Store token and user data
            await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

            return response.data;
        } catch (error: any) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    },

    async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
        return response.data;
    },

    async logout(): Promise<void> {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
    },

    async getStoredToken(): Promise<string | null> {
        return await AsyncStorage.getItem(TOKEN_KEY);
    },

    async getStoredUser(): Promise<User | null> {
        const userJson = await AsyncStorage.getItem(USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>('/auth/me');
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
    },
};
