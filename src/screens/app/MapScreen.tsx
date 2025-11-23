import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocation, useOrder, useUI } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { Order } from '../../types/store';
import { orderService } from '../../services/orderService';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';

const POLLING_INTERVAL = 30000; // 30 seconds
const DEFAULT_RADIUS = 10; // 10 km

export const MapScreen = () => {
    const { currentLocation, hasPermission, requestPermission, startTracking } = useLocation();
    const { setAvailableOrders, acceptOrder: acceptOrderAction } = useOrder();
    const { showSuccess, showError } = useUI();
    const { theme } = useTheme();

    const [availableOrders, setLocalAvailableOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [region, setRegion] = useState<Region | null>(null);

    const mapRef = useRef<MapView>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Fetch available orders
     */
    const fetchAvailableOrders = async () => {
        if (!currentLocation) return;

        try {
            setIsLoading(true);
            const orders = await orderService.getAvailableOrders({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                radius: DEFAULT_RADIUS,
            });

            setLocalAvailableOrders(orders);
            setAvailableOrders(orders);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            showError('Erro', 'Não foi possível carregar os pedidos');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Center map on current location
     */
    const centerOnLocation = () => {
        if (!currentLocation || !mapRef.current) return;

        const newRegion: Region = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };

        mapRef.current.animateToRegion(newRegion, 500);
    };

    /**
     * Fit map to show all markers
     */
    const fitToMarkers = () => {
        if (!mapRef.current || !currentLocation) return;

        const coordinates = [
            {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
            },
            ...availableOrders.map((order) => ({
                latitude: order.pickupLocation.latitude,
                longitude: order.pickupLocation.longitude,
            })),
        ];

        if (coordinates.length > 1) {
            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                animated: true,
            });
        }
    };

    /**
     * Handle order marker press
     */
    const handleOrderPress = (order: Order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    /**
     * Handle accept order
     */
    const handleAcceptOrder = async (order: Order) => {
        try {
            await acceptOrderAction(order.id);
            showSuccess('Sucesso!', 'Pedido aceito! Vá até o local de coleta.');

            // Remove from available orders
            setLocalAvailableOrders((prev) => prev.filter((o) => o.id !== order.id));

            // Refresh orders
            await fetchAvailableOrders();
        } catch (error: any) {
            throw new Error(error.message || 'Erro ao aceitar pedido');
        }
    };

    /**
     * Initialize location and start tracking
     */
    useEffect(() => {
        const initialize = async () => {
            if (!hasPermission) {
                await requestPermission();
            } else {
                startTracking();
            }
        };

        initialize();
    }, [hasPermission]);

    /**
     * Set initial region when location is available
     */
    useEffect(() => {
        if (currentLocation && !region) {
            const initialRegion: Region = {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setRegion(initialRegion);
        }
    }, [currentLocation]);

    /**
     * Fetch orders when location changes
     */
    useEffect(() => {
        if (currentLocation) {
            fetchAvailableOrders();
        }
    }, [currentLocation]);

    /**
     * Start polling for orders
     */
    useEffect(() => {
        if (currentLocation) {
            pollingIntervalRef.current = setInterval(() => {
                fetchAvailableOrders();
            }, POLLING_INTERVAL);
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [currentLocation]);

    /**
     * Fit to markers when orders change
     */
    useEffect(() => {
        if (availableOrders.length > 0) {
            setTimeout(() => fitToMarkers(), 500);
        }
    }, [availableOrders.length]);

    if (!hasPermission) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.permissionText}>
                    Permissão de localização necessária
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!currentLocation || !region) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Obtendo localização...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={region}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
            >
                {/* Current Location Marker */}
                <Marker
                    coordinate={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                    }}
                    title="Você está aqui"
                    pinColor="#007AFF"
                />

                {/* Order Markers */}
                {availableOrders.map((order) => (
                    <Marker
                        key={order.id}
                        coordinate={{
                            latitude: order.pickupLocation.latitude,
                            longitude: order.pickupLocation.longitude,
                        }}
                        title={`R$ ${order.price.toFixed(2)}`}
                        description={order.pickupLocation.address}
                        onPress={() => handleOrderPress(order)}
                    >
                        <View style={[styles.markerContainer, { backgroundColor: theme.colors.surface }]}>
                            <View style={[styles.markerIcon, { backgroundColor: theme.colors.primary }]}>
                                <Ionicons
                                    name={order.category?.icon as any || 'cube'}
                                    size={16}
                                    color="#FFFFFF"
                                />
                            </View>
                            <View style={styles.markerPrice}>
                                <Text style={[styles.markerPriceText, { color: theme.colors.text }]}>
                                    R$ {order.price.toFixed(0)}
                                </Text>
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Loading Indicator */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingOverlayText}>Atualizando...</Text>
                </View>
            )}

            {/* Orders Count */}
            <View style={[styles.ordersCount, { backgroundColor: theme.colors.surface }]}>
                <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.ordersCountText, { color: theme.colors.text }]}>
                    {availableOrders.length} {availableOrders.length === 1 ? 'pedido' : 'pedidos'}
                </Text>
            </View>

            {/* Center Button */}
            <TouchableOpacity
                style={[styles.centerButton, { backgroundColor: theme.colors.surface }]}
                onPress={centerOnLocation}
            >
                <Ionicons name="locate" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            {/* Refresh Button */}
            <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: theme.colors.surface }]}
                onPress={fetchAvailableOrders}
                disabled={isLoading}
            >
                <Ionicons name="refresh" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            {/* Order Details Modal */}
            <OrderDetailsModal
                visible={isModalVisible}
                order={selectedOrder}
                onClose={() => setIsModalVisible(false)}
                onAccept={handleAcceptOrder}
                currentLocation={currentLocation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    loadingOverlayText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#666',
    },
    ordersCount: {
        position: 'absolute',
        top: 60,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    ordersCountText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    centerButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    centerButtonIcon: {
        fontSize: 24,
    },
    refreshButton: {
        position: 'absolute',
        bottom: 160,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    refreshButtonIcon: {
        fontSize: 24,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    markerPrice: {
        backgroundColor: 'white',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    markerPriceText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
