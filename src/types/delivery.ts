export interface DeliveryLocation {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
    phone?: string;
}

export interface DeliveryDetails {
    id: string;
    status: string;
    price: number;
    pickupLocation: DeliveryLocation;
    deliveryLocation: DeliveryLocation;
    establishment: {
        name: string;
        phone: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        description?: string;
    }>;
    distanceToPickup?: number; // in km
    etaToPickup?: number; // in minutes
    createdAt: Date;
    acceptedAt?: Date;
}

export interface TrackingUpdate {
    orderId: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
    speed?: number;
    heading?: number;
}

export type DeliveryStatus =
    | 'ACCEPTED'
    | 'ARRIVED_AT_PICKUP'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'ARRIVED_AT_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';
