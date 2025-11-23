export interface PushNotification {
    id: string;
    type: 'new_order' | 'order_accepted' | 'order_cancelled' | 'support_message';
    title: string;
    message: string;
    data?: {
        orderId?: string;
        messageId?: string;
        [key: string]: any;
    };
    timestamp: number;
    read: boolean;
}

export interface NotificationSettings {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string; // HH:mm format
    quietHoursEnd: string; // HH:mm format
    notificationTypes: {
        newOrder: boolean;
        orderAccepted: boolean;
        orderCancelled: boolean;
        supportMessage: boolean;
    };
}

export interface DeviceToken {
    token: string;
    platform: 'ios' | 'android';
    deviceId: string;
}
