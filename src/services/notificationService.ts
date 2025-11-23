import PushNotification, { PushNotificationObject } from 'react-native-push-notification';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import { NotificationSettings, DeviceToken, PushNotification as AppNotification } from '../types/notification';

const SETTINGS_KEY = '@notification_settings';
const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationTypes: {
        newOrder: true,
        orderAccepted: true,
        orderCancelled: true,
        supportMessage: true,
    },
};

class NotificationService {
    private deviceToken: string | null = null;
    private settings: NotificationSettings = DEFAULT_SETTINGS;
    private onNotificationCallback: ((notification: AppNotification) => void) | null = null;

    /**
     * Initialize push notifications
     */
    initialize(onNotification?: (notification: AppNotification) => void) {
        if (onNotification) {
            this.onNotificationCallback = onNotification;
        }

        // Load settings
        this.loadSettings();

        try {
            if (!PushNotification) {
                console.warn('PushNotification module is not available');
                return;
            }

            // Configure push notifications
            PushNotification.configure({
                // Called when Token is generated (iOS and Android)
                onRegister: (token) => {
                    console.log('Device Token:', token.token);
                    this.deviceToken = token.token;
                    this.registerDeviceToken(token.token);
                },

                // Called when a remote or local notification is opened or received
                onNotification: (notification) => {
                    console.log('Notification received:', notification);
                    this.handleNotification(notification);
                },

                // Android only: GCM or FCM Sender ID
                senderID: 'YOUR_SENDER_ID', // Replace with your FCM Sender ID

                // iOS only
                permissions: {
                    alert: true,
                    badge: true,
                    sound: true,
                },

                // Should the initial notification be popped automatically
                popInitialNotification: true,

                // Request permissions on iOS
                requestPermissions: Platform.OS === 'ios',
            });

            // Create notification channels (Android)
            if (Platform.OS === 'android') {
                this.createNotificationChannels();
            }
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
        }
    }

    /**
     * Create notification channels for Android
     */
    private createNotificationChannels() {
        PushNotification.createChannel(
            {
                channelId: 'new-orders',
                channelName: 'Novos Pedidos',
                channelDescription: 'Notificações de novos pedidos disponíveis',
                playSound: true,
                soundName: 'default',
                importance: 4,
                vibrate: true,
            },
            (created) => console.log(`Channel 'new-orders' created: ${created}`)
        );

        PushNotification.createChannel(
            {
                channelId: 'order-updates',
                channelName: 'Atualizações de Pedidos',
                channelDescription: 'Notificações sobre status de pedidos',
                playSound: true,
                soundName: 'default',
                importance: 3,
                vibrate: true,
            },
            (created) => console.log(`Channel 'order-updates' created: ${created}`)
        );

        PushNotification.createChannel(
            {
                channelId: 'support',
                channelName: 'Suporte',
                channelDescription: 'Mensagens do suporte',
                playSound: true,
                soundName: 'default',
                importance: 3,
                vibrate: false,
            },
            (created) => console.log(`Channel 'support' created: ${created}`)
        );
    }

    /**
     * Handle incoming notification
     */
    private handleNotification(notification: any) {
        const appNotification: AppNotification = {
            id: notification.id || `notif_${Date.now()}`,
            type: notification.data?.type || 'support_message',
            title: notification.title || '',
            message: notification.message || '',
            data: notification.data,
            timestamp: Date.now(),
            read: false,
        };

        // Check if notifications are enabled
        if (!this.settings.enabled) {
            return;
        }

        // Check quiet hours
        if (this.isQuietHours()) {
            return;
        }

        // Check notification type settings
        if (!this.isNotificationTypeEnabled(appNotification.type)) {
            return;
        }

        // Call callback
        if (this.onNotificationCallback) {
            this.onNotificationCallback(appNotification);
        }

        // Finish notification (required for iOS)
        if (notification.finish) {
            notification.finish(PushNotification.FetchResult.NoData);
        }
    }

    /**
     * Check if current time is within quiet hours
     */
    private isQuietHours(): boolean {
        if (!this.settings.quietHoursEnabled) {
            return false;
        }

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const { quietHoursStart, quietHoursEnd } = this.settings;

        if (quietHoursStart < quietHoursEnd) {
            return currentTime >= quietHoursStart && currentTime < quietHoursEnd;
        } else {
            // Crosses midnight
            return currentTime >= quietHoursStart || currentTime < quietHoursEnd;
        }
    }

    /**
     * Check if notification type is enabled
     */
    private isNotificationTypeEnabled(type: AppNotification['type']): boolean {
        const typeMap = {
            new_order: 'newOrder',
            order_accepted: 'orderAccepted',
            order_cancelled: 'orderCancelled',
            support_message: 'supportMessage',
        };

        const settingKey = typeMap[type] as keyof NotificationSettings['notificationTypes'];
        return this.settings.notificationTypes[settingKey] ?? true;
    }

    /**
     * Register device token with backend
     */
    private async registerDeviceToken(token: string) {
        try {
            const deviceToken: DeviceToken = {
                token,
                platform: Platform.OS as 'ios' | 'android',
                deviceId: await this.getDeviceId(),
            };

            await apiClient.post('/drivers/device-token', deviceToken);
            console.log('Device token registered successfully');
        } catch (error) {
            console.error('Error registering device token:', error);
        }
    }

    /**
     * Get device ID
     */
    private async getDeviceId(): Promise<string> {
        try {
            let deviceId = await AsyncStorage.getItem('@device_id');
            if (!deviceId) {
                deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await AsyncStorage.setItem('@device_id', deviceId);
            }
            return deviceId;
        } catch (error) {
            return `${Platform.OS}_${Date.now()}`;
        }
    }

    /**
     * Show local notification
     */
    showLocalNotification(notification: Partial<AppNotification>) {
        if (!PushNotification || !PushNotification.localNotification) {
            console.warn('PushNotification.localNotification not available');
            return;
        }

        const channelId = this.getChannelId(notification.type || 'support_message');

        PushNotification.localNotification({
            channelId,
            title: notification.title || 'Entreggo',
            message: notification.message || '',
            playSound: this.settings.sound,
            soundName: 'default',
            vibrate: this.settings.vibration,
            vibration: 300,
            userInfo: notification.data,
            badge: this.settings.badge ? 1 : undefined,
        });
    }

    /**
     * Get channel ID based on notification type
     */
    private getChannelId(type: AppNotification['type']): string {
        switch (type) {
            case 'new_order':
                return 'new-orders';
            case 'order_accepted':
            case 'order_cancelled':
                return 'order-updates';
            case 'support_message':
                return 'support';
            default:
                return 'support';
        }
    }

    /**
     * Request permissions
     */
    async requestPermissions(): Promise<boolean> {
        if (!PushNotification || !PushNotification.requestPermissions) {
            console.warn('PushNotification.requestPermissions not available');
            return false;
        }
        return new Promise((resolve) => {
            PushNotification.requestPermissions((permissions) => {
                const granted = !!(permissions.alert && permissions.badge && permissions.sound);
                resolve(granted);
            });
        });
    }

    /**
     * Check permissions
     */
    async checkPermissions(): Promise<boolean> {
        if (!PushNotification || !PushNotification.checkPermissions) {
            console.warn('PushNotification.checkPermissions not available');
            return false;
        }
        return new Promise((resolve) => {
            PushNotification.checkPermissions((permissions) => {
                const granted = !!(permissions.alert && permissions.badge && permissions.sound);
                resolve(granted);
            });
        });
    }

    /**
     * Get badge count
     */
    getBadgeCount(): Promise<number> {
        if (!PushNotification || !PushNotification.getApplicationIconBadgeNumber) {
            console.warn('PushNotification.getApplicationIconBadgeNumber not available');
            return Promise.resolve(0);
        }
        return new Promise((resolve) => {
            PushNotification.getApplicationIconBadgeNumber((number) => {
                resolve(number);
            });
        });
    }

    /**
     * Set badge count
     */
    setBadgeCount(count: number) {
        if (!PushNotification || !PushNotification.setApplicationIconBadgeNumber) {
            console.warn('PushNotification.setApplicationIconBadgeNumber not available');
            return;
        }
        PushNotification.setApplicationIconBadgeNumber(count);
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        if (!PushNotification || !PushNotification.removeAllDeliveredNotifications) {
            console.warn('PushNotification.removeAllDeliveredNotifications not available');
            return;
        }
        PushNotification.removeAllDeliveredNotifications();
        this.setBadgeCount(0);
    }

    /**
     * Cancel specific notification
     */
    cancelNotification(id: string) {
        if (!PushNotification || !PushNotification.cancelLocalNotification) {
            console.warn('PushNotification.cancelLocalNotification not available');
            return;
        }
        PushNotification.cancelLocalNotification(id);
    }

    /**
     * Load settings from storage
     */
    async loadSettings(): Promise<NotificationSettings> {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_KEY);
            if (stored) {
                this.settings = JSON.parse(stored);
            } else {
                this.settings = DEFAULT_SETTINGS;
            }
            return this.settings;
        } catch (error) {
            console.error('Error loading notification settings:', error);
            return DEFAULT_SETTINGS;
        }
    }

    /**
     * Save settings to storage
     */
    async saveSettings(settings: NotificationSettings): Promise<void> {
        try {
            this.settings = settings;
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving notification settings:', error);
            throw error;
        }
    }

    /**
     * Get current settings
     */
    getSettings(): NotificationSettings {
        return this.settings;
    }

    /**
     * Get device token
     */
    getDeviceToken(): string | null {
        return this.deviceToken;
    }
}

export const notificationService = new NotificationService();
