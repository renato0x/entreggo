declare module 'react-native-push-notification' {
    export interface PushNotificationObject {
        id?: string;
        title?: string;
        message?: string;
        userInfo?: any;
        data?: any;
        channelId?: string;
        playSound?: boolean;
        soundName?: string;
        vibrate?: boolean;
        vibration?: number;
        badge?: number;
        finish?: (result: string) => void;
    }

    export interface PushNotificationPermissions {
        alert?: boolean;
        badge?: boolean;
        sound?: boolean;
    }

    export interface PushNotificationOptions {
        onRegister?: (token: { os: string; token: string }) => void;
        onNotification?: (notification: PushNotificationObject) => void;
        senderID?: string;
        permissions?: PushNotificationPermissions;
        popInitialNotification?: boolean;
        requestPermissions?: boolean;
    }

    export interface ChannelOptions {
        channelId: string;
        channelName: string;
        channelDescription?: string;
        playSound?: boolean;
        soundName?: string;
        importance?: number;
        vibrate?: boolean;
    }

    export default class PushNotification {
        static configure(options: PushNotificationOptions): void;
        static createChannel(options: ChannelOptions, callback: (created: boolean) => void): void;
        static localNotification(notification: PushNotificationObject): void;
        static cancelLocalNotification(id: string): void;
        static removeAllDeliveredNotifications(): void;
        static getApplicationIconBadgeNumber(callback: (count: number) => void): void;
        static setApplicationIconBadgeNumber(count: number): void;
        static requestPermissions(callback?: (permissions: PushNotificationPermissions) => void): void;
        static checkPermissions(callback: (permissions: PushNotificationPermissions) => void): void;
        static FetchResult: {
            NoData: string;
            NewData: string;
            ResultFailed: string;
        };
    }
}
