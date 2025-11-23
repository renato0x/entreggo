import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { notificationService } from '../services/notificationService';
import { NotificationSettings, PushNotification } from '../types/notification';
import { useUI } from './useUI';

export const useNotifications = () => {
    const { addNotification } = useUI();
    const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [badgeCount, setBadgeCount] = useState(0);
    const [deviceToken, setDeviceToken] = useState<string | null>(null);

    /**
     * Handle incoming notification
     */
    const handleNotification = (notification: PushNotification) => {
        console.log('Notification received in hook:', notification);

        // Add to UI store
        addNotification({
            type: notification.type === 'new_order' ? 'success' : 'info',
            title: notification.title,
            message: notification.message,
        });

        // Update badge count
        updateBadgeCount();
    };

    /**
     * Initialize notifications
     */
    const initialize = async () => {
        try {
            // Initialize service
            notificationService.initialize(handleNotification);

            // Load settings
            const loadedSettings = await notificationService.loadSettings();
            setSettings(loadedSettings);

            // Check permissions
            const permitted = await notificationService.checkPermissions();
            setHasPermission(permitted);

            // Get device token
            const token = notificationService.getDeviceToken();
            setDeviceToken(token);

            // Get badge count
            updateBadgeCount();
        } catch (error) {
            console.warn('Failed to initialize notifications:', error);
            // Set default values on error
            setHasPermission(false);
            setDeviceToken(null);
        }
    };

    /**
     * Request permissions
     */
    const requestPermissions = async (): Promise<boolean> => {
        try {
            const granted = await notificationService.requestPermissions();
            setHasPermission(granted);
            return granted;
        } catch (error) {
            console.warn('Failed to request permissions:', error);
            setHasPermission(false);
            return false;
        }
    };

    /**
     * Update settings
     */
    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        const updated = { ...settings, ...newSettings };
        await notificationService.saveSettings(updated);
        setSettings(updated);
    };

    /**
     * Update badge count
     */
    const updateBadgeCount = async () => {
        try {
            const count = await notificationService.getBadgeCount();
            setBadgeCount(count);
        } catch (error) {
            console.warn('Failed to update badge count:', error);
            setBadgeCount(0);
        }
    };

    /**
     * Clear all notifications
     */
    const clearAll = () => {
        notificationService.clearAllNotifications();
        setBadgeCount(0);
    };

    /**
     * Show local notification
     */
    const showLocal = (notification: Partial<PushNotification>) => {
        notificationService.showLocalNotification(notification);
    };

    /**
     * Initialize on mount
     */
    useEffect(() => {
        initialize();

        // Update badge count when app comes to foreground
        const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
            if (state === 'active') {
                updateBadgeCount();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return {
        // State
        settings,
        hasPermission,
        badgeCount,
        deviceToken,

        // Actions
        requestPermissions,
        updateSettings,
        clearAll,
        showLocal,
        updateBadgeCount,
    };
};
