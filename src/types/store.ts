import { User } from './auth';

// Location Types
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
}

export interface LocationHistory {
    id: string;
    location: Location;
    createdAt: string;
}

// Order Types
export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    pickupAddress: string;
    pickupLocation: Location;
    deliveryAddress: string;
    deliveryLocation: Location;
    distance: number;
    price: number;
    status: 'available' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    createdAt: string;
    acceptedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    otp?: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

// Wallet Types
export interface Transaction {
    id: string;
    type: 'earning' | 'withdrawal' | 'bonus' | 'penalty';
    amount: number;
    description: string;
    orderId?: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export interface Wallet {
    balance: number;
    totalEarnings: number;
    pendingAmount: number;
    transactions: Transaction[];
}

// UI Types
export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

export interface LoadingState {
    [key: string]: boolean;
}

export interface ErrorState {
    [key: string]: string | null;
}

// Store States
export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface LocationState {
    currentLocation: Location | null;
    isTracking: boolean;
    locationHistory: LocationHistory[];
    error: string | null;
}

export interface OrderState {
    availableOrders: Order[];
    activeOrder: Order | null;
    orderHistory: Order[];
    isLoading: boolean;
    error: string | null;
}

export interface WalletState {
    wallet: Wallet;
    isLoading: boolean;
    error: string | null;
}

export interface UIState {
    notifications: Notification[];
    loadingStates: LoadingState;
    errors: ErrorState;
    isOnline: boolean;
}
