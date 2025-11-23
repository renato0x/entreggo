import { create } from 'zustand';
import { Notification, UIState, LoadingState, ErrorState } from '../types/store';

interface UIActions {
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationAsRead: (id: string) => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
    setLoading: (key: string, isLoading: boolean) => void;
    setError: (key: string, error: string | null) => void;
    clearError: (key: string) => void;
    clearAllErrors: () => void;
    setOnlineStatus: (isOnline: boolean) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
    // Initial State
    notifications: [],
    loadingStates: {},
    errors: {},
    isOnline: true,

    // Actions
    addNotification: (notification) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif_${Date.now()}`,
            timestamp: Date.now(),
            read: false,
        };

        set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        }));
    },

    markNotificationAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            ),
        }));
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((notif) => notif.id !== id),
        }));
    },

    clearAllNotifications: () => {
        set({ notifications: [] });
    },

    setLoading: (key, isLoading) => {
        set((state) => ({
            loadingStates: {
                ...state.loadingStates,
                [key]: isLoading,
            },
        }));
    },

    setError: (key, error) => {
        set((state) => ({
            errors: {
                ...state.errors,
                [key]: error,
            },
        }));
    },

    clearError: (key) => {
        set((state) => {
            const newErrors = { ...state.errors };
            delete newErrors[key];
            return { errors: newErrors };
        });
    },

    clearAllErrors: () => {
        set({ errors: {} });
    },

    setOnlineStatus: (isOnline) => {
        set({ isOnline });
    },
}));
