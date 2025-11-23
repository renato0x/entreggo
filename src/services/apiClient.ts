import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const TOKEN_KEY = '@entreggo:token';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add token
        this.client.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem(TOKEN_KEY);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    await AsyncStorage.removeItem(TOKEN_KEY);
                }
                return Promise.reject(error);
            }
        );
    }

    getClient(): AxiosInstance {
        return this.client;
    }
}

export const apiClient = new ApiClient().getClient();
