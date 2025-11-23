import { create } from 'zustand';
import { User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    login: (user: User, token: string) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,

    setUser: (user) => set({ user }),

    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    login: (user, token) => set({ isAuthenticated: true, user, token, error: null }),

    logout: async () => {
        await authService.logout();
        set({ isAuthenticated: false, user: null, token: null, error: null });
    },

    checkAuth: async () => {
        try {
            set({ isLoading: true });
            const token = await authService.getStoredToken();

            if (token) {
                const user = await authService.getCurrentUser();
                set({ isAuthenticated: true, user, token, isLoading: false });
            } else {
                set({ isAuthenticated: false, user: null, token: null, isLoading: false });
            }
        } catch (error) {
            set({ isAuthenticated: false, user: null, token: null, isLoading: false });
        }
    },
}));
