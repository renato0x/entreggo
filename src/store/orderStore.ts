import { create } from 'zustand';
import { Order, OrderState } from '../types/store';

interface OrderActions {
    setAvailableOrders: (orders: Order[]) => void;
    addAvailableOrder: (order: Order) => void;
    removeAvailableOrder: (orderId: string) => void;
    setActiveOrder: (order: Order | null) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    addToHistory: (order: Order) => void;
    clearActiveOrder: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchAvailableOrders: () => Promise<void>;
    acceptOrder: (orderId: string) => Promise<void>;
    completeOrder: (orderId: string, otp: string) => Promise<void>;
}

type OrderStore = OrderState & OrderActions;

export const useOrderStore = create<OrderStore>((set, get) => ({
    // Initial State
    availableOrders: [],
    activeOrder: null,
    orderHistory: [],
    isLoading: false,
    error: null,

    // Actions
    setAvailableOrders: (orders) => {
        set({ availableOrders: orders, error: null });
    },

    addAvailableOrder: (order) => {
        set((state) => ({
            availableOrders: [...state.availableOrders, order],
        }));
    },

    removeAvailableOrder: (orderId) => {
        set((state) => ({
            availableOrders: state.availableOrders.filter((o) => o.id !== orderId),
        }));
    },

    setActiveOrder: (order) => {
        set({ activeOrder: order });
    },

    updateOrderStatus: (orderId, status) => {
        set((state) => {
            // Update active order if it matches
            if (state.activeOrder?.id === orderId) {
                return {
                    activeOrder: { ...state.activeOrder, status },
                };
            }

            // Update in available orders
            return {
                availableOrders: state.availableOrders.map((order) =>
                    order.id === orderId ? { ...order, status } : order
                ),
            };
        });
    },

    addToHistory: (order) => {
        set((state) => ({
            orderHistory: [order, ...state.orderHistory],
        }));
    },

    clearActiveOrder: () => {
        const { activeOrder } = get();
        if (activeOrder) {
            get().addToHistory(activeOrder);
            set({ activeOrder: null });
        }
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error });
    },

    // Async Actions (to be implemented with API calls)
    fetchAvailableOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            // TODO: Implement API call
            // const orders = await orderService.fetchAvailable();
            // set({ availableOrders: orders });

            // Mock data for now
            await new Promise((resolve) => setTimeout(resolve, 1000));
            set({ availableOrders: [] });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    acceptOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            // TODO: Implement API call
            // const order = await orderService.accept(orderId);

            const order = get().availableOrders.find((o) => o.id === orderId);
            if (order) {
                get().removeAvailableOrder(orderId);
                get().setActiveOrder({ ...order, status: 'accepted' });
            }
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    completeOrder: async (orderId, otp) => {
        set({ isLoading: true, error: null });
        try {
            // TODO: Implement API call with OTP verification
            // await orderService.complete(orderId, otp);

            get().updateOrderStatus(orderId, 'delivered');
            get().clearActiveOrder();
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },
}));
