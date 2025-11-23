import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { webSocketService } from '../services/websocketService';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';
import { useNotifications } from './useNotifications';
import { useOrder } from './useOrder';
import { orderService } from '../services/orderService'; // Import orderService
import { OrderOffer, WebSocketStatus } from '../types/websocket';

export const useWebSocket = () => {
    const { token, isAuthenticated } = useAuth();
    const { currentLocation } = useLocation();
    const { showLocal } = useNotifications();
    const { setAvailableOrders } = useOrder();

    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const [currentOffer, setCurrentOffer] = useState<OrderOffer | null>(null);
    const [queuePosition, setQueuePosition] = useState<number | null>(null);

    const appState = useRef(AppState.currentState);

    /**
     * Connect when authenticated
     */
    useEffect(() => {
        if (isAuthenticated && token) {
            setStatus('connecting');
            webSocketService.connect(token);

            const socket = webSocketService.getSocket();
            if (socket) {
                socket.on('connect', () => setStatus('connected'));
                socket.on('disconnect', () => setStatus('disconnected'));
                socket.on('connect_error', () => setStatus('reconnecting'));
            }
        } else {
            webSocketService.disconnect();
            setStatus('disconnected');
        }

        return () => {
            webSocketService.disconnect();
        };
    }, [isAuthenticated, token]);

    /**
     * Send location updates
     */
    useEffect(() => {
        if (currentLocation && status === 'connected') {
            webSocketService.updateLocation(currentLocation);
        }
    }, [currentLocation, status]);

    /**
     * Handle Order Events
     */
    useEffect(() => {
        if (status !== 'connected') return;

        const handleOrderOffered = (offer: OrderOffer) => {
            console.log('New Order Offer:', offer);
            setCurrentOffer(offer);

            showLocal({
                title: 'Nova Oferta de Entrega! 🚀',
                message: `Pedido de R$ ${offer.order.price.toFixed(2)} disponível. Toque para ver!`,
                type: 'new_order',
                data: { orderId: offer.orderId }
            });
        };

        const handleOrderTimeout = (data: { orderId: string }) => {
            console.log('Order Timeout:', data);
            if (currentOffer?.orderId === data.orderId) {
                setCurrentOffer(null);
                setQueuePosition(null);

                showLocal({
                    title: 'Oferta Expirou ⏰',
                    message: 'O tempo para aceitar o pedido acabou.',
                    type: 'support_message'
                });
            }
        };

        const handleQueuePosition = (data: { position: number }) => {
            setQueuePosition(data.position);
        };

        webSocketService.on('order-offered', handleOrderOffered);
        webSocketService.on('order-timeout', handleOrderTimeout);
        webSocketService.on('order-queue-position', handleQueuePosition);

        return () => {
            webSocketService.off('order-offered', handleOrderOffered);
            webSocketService.off('order-timeout', handleOrderTimeout);
            webSocketService.off('order-queue-position', handleQueuePosition);
        };
    }, [status, currentOffer]);

    /**
     * Handle App State (Background/Foreground)
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (isAuthenticated && token && !webSocketService.isConnected()) {
                    webSocketService.connect(token);
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isAuthenticated, token]);

    // Modified to use HTTP for transaction safety
    const acceptOffer = async (orderId: string) => {
        try {
            await orderService.acceptOrder({ orderId });
            // Optional: Notify via socket if needed, but HTTP success is enough for client state
            // webSocketService.acceptOffer(orderId); 
            setCurrentOffer(null);
            setQueuePosition(null);
        } catch (error) {
            throw error; // Re-throw to be handled by the component
        }
    };

    const rejectOffer = (orderId: string, reason?: string) => {
        webSocketService.rejectOffer(orderId, reason);
        setCurrentOffer(null);
        setQueuePosition(null);
    };

    return {
        status,
        currentOffer,
        queuePosition,
        acceptOffer,
        rejectOffer,
        isConnected: status === 'connected',
    };
};
