import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Order } from '../types/store';
import { orderService } from '../services/orderService';

interface OrderDetailsModalProps {
    visible: boolean;
    order: Order | null;
    onClose: () => void;
    onAccept: (order: Order) => void;
    currentLocation?: { latitude: number; longitude: number };
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    visible,
    order,
    onClose,
    onAccept,
    currentLocation,
}) => {
    const [isAccepting, setIsAccepting] = useState(false);

    if (!order) return null;

    const distance = currentLocation
        ? orderService.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            order.pickupLocation.latitude,
            order.pickupLocation.longitude
        )
        : order.distance;

    const estimatedTime = orderService.estimateDeliveryTime(distance);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            await onAccept(order);
            onClose();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível aceitar o pedido');
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Order ID */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Pedido #{order.id.slice(0, 8)}</Text>
                        </View>

                        {/* Price */}
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>Valor da Entrega</Text>
                            <Text style={styles.priceValue}>R$ {order.price.toFixed(2)}</Text>
                        </View>

                        {/* Distance and Time */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoIcon}>📏</Text>
                                <Text style={styles.infoLabel}>Distância</Text>
                                <Text style={styles.infoValue}>{distance.toFixed(1)} km</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoIcon}>⏱️</Text>
                                <Text style={styles.infoLabel}>Tempo Est.</Text>
                                <Text style={styles.infoValue}>{estimatedTime} min</Text>
                            </View>
                        </View>

                        {/* Pickup Location */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📍 Coleta</Text>
                            <Text style={styles.addressText}>{order.pickupAddress}</Text>
                            {order.customerName && (
                                <Text style={styles.customerText}>Cliente: {order.customerName}</Text>
                            )}
                        </View>

                        {/* Delivery Location */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📍 Entrega</Text>
                            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                            {order.customerPhone && (
                                <Text style={styles.customerText}>Tel: {order.customerPhone}</Text>
                            )}
                        </View>

                        {/* Items */}
                        {order.items && order.items.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📦 Itens</Text>
                                {order.items.map((item, index) => (
                                    <View key={index} style={styles.itemRow}>
                                        <Text style={styles.itemName}>
                                            {item.quantity}x {item.name}
                                        </Text>
                                        <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Created At */}
                        <View style={styles.section}>
                            <Text style={styles.timestamp}>
                                Criado em: {new Date(order.createdAt).toLocaleString('pt-BR')}
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Accept Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.acceptButton, isAccepting && styles.acceptButtonDisabled]}
                            onPress={handleAccept}
                            disabled={isAccepting}
                        >
                            {isAccepting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.acceptButtonText}>✓ Aceitar Entrega</Text>
                                    <Text style={styles.acceptButtonSubtext}>
                                        Ganhe R$ {order.price.toFixed(2)}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    priceContainer: {
        backgroundColor: '#E8F5E9',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 14,
        color: '#2E7D32',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1B5E20',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    infoItem: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    customerText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemName: {
        fontSize: 14,
        color: '#333',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    acceptButton: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    acceptButtonDisabled: {
        backgroundColor: '#ccc',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    acceptButtonSubtext: {
        color: '#fff',
        fontSize: 14,
        marginTop: 4,
        opacity: 0.9,
    },
});
