import { Location, Order } from './store';

export interface OrderOffer {
    orderId: string;
    expiresAt: number; // Timestamp when offer expires (30s)
    order: Order;
    queuePosition?: number;
}

export interface QueuePositionUpdate {
    orderId: string;
    position: number;
    estimatedWaitTime: number;
}

export interface ServerToClientEvents {
    'connect': () => void;
    'disconnect': () => void;
    'order-offered': (offer: OrderOffer) => void;
    'order-timeout': (data: { orderId: string }) => void;
    'order-queue-position': (data: QueuePositionUpdate) => void;
    'new-order': (data: { orderId: string }) => void; // Generic broadcast
    'order-accepted': (data: { orderId: string }) => void; // Broadcast when someone accepts
}

export interface ClientToServerEvents {
    'location-update': (location: Location) => void;
    'join-queue': (data: { available: boolean }) => void;
    'accept-offer': (data: { orderId: string }) => void;
    'reject-offer': (data: { orderId: string; reason?: string }) => void;
}

export type WebSocketStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
