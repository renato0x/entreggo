import { User } from './auth';

// Location Types
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    address?: string;
}

export interface LocationHistory {
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    active: boolean;
}

export interface DriverCategory {
    id: string;
    categoryId: string;
    driverId: string;
    status: 'pending' | 'approved' | 'rejected';
    category?: Category;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'ARRIVED_AT_DELIVERY' | 'COMPLETED' | 'CANCELLED' | 'PROBLEM' | 'RETURNED';
    price: number;
    pickupLocation: Location;
    deliveryLocation: Location;
    driverId?: string;
    establishmentId?: string;
    customerPhone?: string;
    categoryId?: string;
    category?: Category;
    createdAt: string;
    acceptedAt?: string;
    completedAt?: string;
    items?: OrderItem[];
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
