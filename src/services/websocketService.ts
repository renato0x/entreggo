import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';
import { Location } from '../types/store';
import { ClientToServerEvents, ServerToClientEvents } from '../types/websocket';

class WebSocketService {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    private token: string | null = null;

    /**
     * Initialize and connect WebSocket
     */
    connect(token: string) {
        if (this.socket?.connected) {
            return;
        }

        this.token = token;

        this.socket = io(API_BASE_URL, {
            auth: {
                token,
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupListeners();
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Setup default listeners
     */
    private setupListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('WebSocket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    /**
     * Emit location update
     */
    updateLocation(location: Location) {
        if (this.socket?.connected) {
            this.socket.emit('location-update', location);
        }
    }

    /**
     * Accept order offer
     */
    acceptOffer(orderId: string) {
        if (this.socket?.connected) {
            this.socket.emit('accept-offer', { orderId });
        }
    }

    /**
     * Reject order offer
     */
    rejectOffer(orderId: string, reason?: string) {
        if (this.socket?.connected) {
            this.socket.emit('reject-offer', { orderId, reason });
        }
    }

    /**
     * Subscribe to event
     */
    on<E extends keyof ServerToClientEvents>(event: E, callback: any) {
        this.socket?.on(event, callback);
    }

    /**
     * Unsubscribe from event
     */
    off<E extends keyof ServerToClientEvents>(event: E, callback?: any) {
        this.socket?.off(event, callback);
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return !!this.socket?.connected;
    }

    /**
     * Get socket instance
     */
    getSocket() {
        return this.socket;
    }
}

export const webSocketService = new WebSocketService();
