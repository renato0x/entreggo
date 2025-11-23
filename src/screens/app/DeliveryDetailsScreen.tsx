import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { DeliveryMap } from '../../components/DeliveryMap';
import { trackingService } from '../../services/trackingService';
import { useLocation } from '../../hooks/useLocation';
import { DeliveryDetails } from '../../types/delivery';
import { orderService } from '../../services/orderService';

type Props = NativeStackScreenProps<RootStackParamList, 'DeliveryDetails'>;

export const DeliveryDetailsScreen = ({ route, navigation }: Props) => {
    const { orderId } = route.params;
    const { currentLocation } = useLocation();

    const [delivery, setDelivery] = useState<DeliveryDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadDeliveryDetails();

        // Start tracking
        if (currentLocation) {
            trackingService.startTracking(orderId, (lat, lng) => {
                // Send location update
                trackingService.sendLocationUpdate({
                    orderId,
                    latitude: lat,
                    longitude: lng,
                    timestamp: new Date(),
                });
            });
        }

        return () => {
            trackingService.stopTracking();
        };
    }, [orderId]);

    // Send location updates every 10 seconds
    useEffect(() => {
        if (!currentLocation || !delivery) return;

        const interval = setInterval(() => {
            trackingService.sendLocationUpdate({
                orderId,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                timestamp: new Date(),
                speed: currentLocation.speed,
                heading: currentLocation.heading,
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [currentLocation, delivery, orderId]);

    const loadDeliveryDetails = async () => {
        try {
            setIsLoading(true);
            const data = await trackingService.getDeliveryDetails(orderId);
            setDelivery(data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da entrega.');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartNavigation = () => {
        if (!delivery) return;

        const { latitude, longitude } = delivery.pickupLocation;
        const label = delivery.establishment.name;

        const scheme = Platform.select({
            ios: 'maps:0,0?q=',
            android: 'geo:0,0?q=',
        });
        const latLng = `${latitude},${longitude}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    const handleArrivedAtPickup = async () => {
        Alert.alert(
            'Confirmar Chegada',
            'Você chegou no local de retirada?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            setIsUpdating(true);
                            const updated = await trackingService.arrivedAtPickup(orderId);
                            setDelivery(updated);
                            Alert.alert('Sucesso', 'Status atualizado!');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível atualizar o status.');
                        } finally {
                            setIsUpdating(false);
                        }
                    },
                },
            ]
        );
    };

    const handleCallEstablishment = () => {
        if (!delivery) return;
        const phone = delivery.establishment.phone.replace(/\D/g, '');
        Linking.openURL(`tel:${phone}`);
    };

    const handleCancelDelivery = () => {
        Alert.alert(
            'Cancelar Entrega',
            'Tem certeza que deseja cancelar esta entrega? Esta ação não pode ser desfeita.',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, Cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsUpdating(true);
                            await trackingService.cancelDelivery(orderId, 'Cancelado pelo entregador');
                            Alert.alert('Cancelado', 'Entrega cancelada com sucesso.', [
                                { text: 'OK', onPress: () => navigation.goBack() },
                            ]);
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível cancelar a entrega.');
                        } finally {
                            setIsUpdating(false);
                        }
                    },
                },
            ]
        );
    };

    if (isLoading || !delivery) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Carregando detalhes...</Text>
            </View>
        );
    }

    const distance = delivery.distanceToPickup || 0;
    const eta = delivery.etaToPickup || 0;

    return (
        <View style={styles.container}>
            {/* Map Section */}
            <View style={styles.mapContainer}>
                <DeliveryMap
                    currentLocation={currentLocation}
                    pickupLocation={delivery.pickupLocation}
                    deliveryLocation={delivery.deliveryLocation}
                />
            </View>

            {/* Details Section */}
            <ScrollView style={styles.detailsContainer}>
                {/* Status Badge */}
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{delivery.status}</Text>
                </View>

                {/* Establishment Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="business" size={24} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Estabelecimento</Text>
                    </View>
                    <Text style={styles.establishmentName}>{delivery.establishment.name}</Text>
                    <TouchableOpacity onPress={handleCallEstablishment} style={styles.phoneButton}>
                        <Ionicons name="call" size={16} color="#007AFF" />
                        <Text style={styles.phoneText}>{delivery.establishment.phone}</Text>
                    </TouchableOpacity>
                </View>

                {/* Pickup Location */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={24} color="#22C55E" />
                        <Text style={styles.sectionTitle}>Retirada</Text>
                    </View>
                    <Text style={styles.address}>{delivery.pickupLocation.address}</Text>
                    <View style={styles.distanceRow}>
                        <Text style={styles.distanceText}>📍 {distance.toFixed(1)} km</Text>
                        <Text style={styles.etaText}>⏱️ {eta} min</Text>
                    </View>
                </View>

                {/* Delivery Location */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="flag" size={24} color="#EF4444" />
                        <Text style={styles.sectionTitle}>Entrega</Text>
                    </View>
                    <Text style={styles.address}>{delivery.deliveryLocation.address}</Text>
                </View>

                {/* Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cube" size={24} color="#F59E0B" />
                        <Text style={styles.sectionTitle}>Itens</Text>
                    </View>
                    {delivery.items.map((item, index) => (
                        <View key={index} style={styles.item}>
                            <Text style={styles.itemName}>
                                {item.quantity}x {item.name}
                            </Text>
                            {item.description && (
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Price */}
                <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Valor da Entrega</Text>
                    <Text style={styles.priceValue}>R$ {delivery.price.toFixed(2)}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleStartNavigation}
                    >
                        <Ionicons name="navigate" size={20} color="#FFF" />
                        <Text style={styles.primaryButtonText}>Iniciar Navegação</Text>
                    </TouchableOpacity>

                    {delivery.status === 'ACCEPTED' && (
                        <TouchableOpacity
                            style={[styles.primaryButton, styles.arrivedButton]}
                            onPress={handleArrivedAtPickup}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                                    <Text style={styles.primaryButtonText}>Cheguei na Retirada</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelDelivery}
                        disabled={isUpdating}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar Entrega</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    mapContainer: {
        height: 300,
    },
    detailsContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    statusText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    establishmentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneText: {
        fontSize: 14,
        color: '#007AFF',
        marginLeft: 4,
    },
    address: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    distanceRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 16,
    },
    distanceText: {
        fontSize: 14,
        color: '#22C55E',
        fontWeight: '600',
    },
    etaText: {
        fontSize: 14,
        color: '#F59E0B',
        fontWeight: '600',
    },
    item: {
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    itemDescription: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    priceSection: {
        backgroundColor: '#F0F9FF',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    actionsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    arrivedButton: {
        backgroundColor: '#22C55E',
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#EF4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
});
