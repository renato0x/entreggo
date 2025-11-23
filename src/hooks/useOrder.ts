import { useOrderStore } from '../store/orderStore';

/**
 * Custom hook for order management
 * Provides easy access to order state and actions
 */
export const useOrder = () => {
    const availableOrders = useOrderStore((state) => state.availableOrders);
    const activeOrder = useOrderStore((state) => state.activeOrder);
    const orderHistory = useOrderStore((state) => state.orderHistory);
    const isLoading = useOrderStore((state) => state.isLoading);
    const error = useOrderStore((state) => state.error);

    const setAvailableOrders = useOrderStore((state) => state.setAvailableOrders);
    const addAvailableOrder = useOrderStore((state) => state.addAvailableOrder);
    const removeAvailableOrder = useOrderStore((state) => state.removeAvailableOrder);
    const setActiveOrder = useOrderStore((state) => state.setActiveOrder);
    const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
    const addToHistory = useOrderStore((state) => state.addToHistory);
    const clearActiveOrder = useOrderStore((state) => state.clearActiveOrder);
    const setLoading = useOrderStore((state) => state.setLoading);
    const setError = useOrderStore((state) => state.setError);
    const fetchAvailableOrders = useOrderStore((state) => state.fetchAvailableOrders);
    const acceptOrder = useOrderStore((state) => state.acceptOrder);
    const completeOrder = useOrderStore((state) => state.completeOrder);

    return {
        // State
        availableOrders,
        activeOrder,
        orderHistory,
        isLoading,
        error,

        // Computed
        hasActiveOrder: activeOrder !== null,
        availableOrdersCount: availableOrders.length,
        completedOrdersCount: orderHistory.filter((o) => o.status === 'delivered').length,

        // Actions
        setAvailableOrders,
        addAvailableOrder,
        removeAvailableOrder,
        setActiveOrder,
        updateOrderStatus,
        addToHistory,
        clearActiveOrder,
        setLoading,
        setError,
        fetchAvailableOrders,
        acceptOrder,
        completeOrder,
    };
};
