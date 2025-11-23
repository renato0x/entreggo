import { useUIStore } from '../store/uiStore';
import { Notification } from '../types/store';

/**
 * Custom hook for UI state management
 * Provides easy access to notifications, loading states, and errors
 */
export const useUI = () => {
    const notifications = useUIStore((state) => state.notifications);
    const loadingStates = useUIStore((state) => state.loadingStates);
    const errors = useUIStore((state) => state.errors);
    const isOnline = useUIStore((state) => state.isOnline);

    const addNotification = useUIStore((state) => state.addNotification);
    const markNotificationAsRead = useUIStore((state) => state.markNotificationAsRead);
    const removeNotification = useUIStore((state) => state.removeNotification);
    const clearAllNotifications = useUIStore((state) => state.clearAllNotifications);
    const setLoading = useUIStore((state) => state.setLoading);
    const setError = useUIStore((state) => state.setError);
    const clearError = useUIStore((state) => state.clearError);
    const clearAllErrors = useUIStore((state) => state.clearAllErrors);
    const setOnlineStatus = useUIStore((state) => state.setOnlineStatus);

    // Helper functions
    const showSuccess = (title: string, message: string) => {
        addNotification({ type: 'success', title, message });
    };

    const showError = (title: string, message: string) => {
        addNotification({ type: 'error', title, message });
    };

    const showInfo = (title: string, message: string) => {
        addNotification({ type: 'info', title, message });
    };

    const showWarning = (title: string, message: string) => {
        addNotification({ type: 'warning', title, message });
    };

    const isLoading = (key: string): boolean => {
        return loadingStates[key] || false;
    };

    const getError = (key: string): string | null => {
        return errors[key] || null;
    };

    return {
        // State
        notifications,
        loadingStates,
        errors,
        isOnline,

        // Computed
        unreadNotifications: notifications.filter((n) => !n.read),
        unreadCount: notifications.filter((n) => !n.read).length,
        hasErrors: Object.keys(errors).length > 0,

        // Actions
        addNotification,
        markNotificationAsRead,
        removeNotification,
        clearAllNotifications,
        setLoading,
        setError,
        clearError,
        clearAllErrors,
        setOnlineStatus,

        // Helpers
        showSuccess,
        showError,
        showInfo,
        showWarning,
        isLoading,
        getError,
    };
};
