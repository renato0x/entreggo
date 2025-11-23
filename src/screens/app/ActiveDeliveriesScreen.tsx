import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrder, useUI } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ActiveDeliveriesScreen = () => {
    const { activeOrder, updateOrderStatus, completeOrder } = useOrder();
    const { showSuccess, showError } = useUI();
    const { theme } = useTheme();

    const handlePickup = async () => {
        if (!activeOrder) return;

        try {
            updateOrderStatus(activeOrder.id, 'picked_up');
            showSuccess('Sucesso', 'Pedido coletado! Siga para o endereço de entrega.');
        } catch (error) {
            showError('Erro', 'Não foi possível atualizar o status');
        }
    };

    const handleComplete = async () => {
        if (!activeOrder) return;

        // TODO: Show OTP input dialog
        const otp = '1234'; // Mock OTP

        try {
            await completeOrder(activeOrder.id, otp);
            showSuccess('Sucesso', 'Entrega concluída! Parabéns!');
        } catch (error) {
            showError('Erro', 'OTP inválido ou erro ao finalizar entrega');
        }
    };

    if (!activeOrder) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="bicycle-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    Nenhuma entrega ativa
                </Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Aceite um pedido na tela inicial para começar
                </Text>
            </View>
        );
    }

    const isPickedUp = activeOrder.status === 'picked_up' || activeOrder.status === 'in_transit';

    const getStatusInfo = () => {
        switch (activeOrder.status) {
            case 'accepted':
                return { icon: 'checkmark-circle', text: 'Aceito', color: theme.colors.info };
            case 'picked_up':
                return { icon: 'cube', text: 'Coletado', color: theme.colors.warning };
            case 'in_transit':
                return { icon: 'bicycle', text: 'Em trânsito', color: theme.colors.primary };
            default:
                return { icon: 'help-circle', text: activeOrder.status, color: theme.colors.textTertiary };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Entrega Ativa</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Ionicons name={statusInfo.icon as any} size={16} color="#FFFFFF" />
                    <Text style={styles.statusText}>{statusInfo.text}</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
                {/* Order Info */}
                <Card elevated style={{ marginBottom: theme.spacing.md }}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                        Informações do Pedido
                    </Text>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Pedido:</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>
                            #{activeOrder.id.slice(0, 8)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Valor:</Text>
                        <Text style={[styles.value, styles.price, { color: theme.colors.success }]}>
                            R$ {activeOrder.price.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Distância:</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>
                            {activeOrder.distance.toFixed(1)} km
                        </Text>
                    </View>
                </Card>

                {/* Pickup Location */}
                <Card elevated style={{ marginBottom: theme.spacing.md }}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location" size={20} color={theme.colors.primary} />
                        <Text style={[styles.cardTitle, { color: theme.colors.text, marginLeft: 8 }]}>
                            Local de Coleta
                        </Text>
                    </View>
                    <Text style={[styles.address, { color: theme.colors.textSecondary }]}>
                        {activeOrder.pickupAddress}
                    </Text>
                    <TouchableOpacity
                        style={[styles.mapButton, { backgroundColor: theme.colors.surface }]}
                    >
                        <Ionicons name="map-outline" size={16} color={theme.colors.primary} />
                        <Text style={[styles.mapButtonText, { color: theme.colors.primary }]}>
                            Abrir no Mapa
                        </Text>
                    </TouchableOpacity>
                </Card>

                {/* Delivery Location */}
                <Card elevated style={{ marginBottom: theme.spacing.md }}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="navigate" size={20} color={theme.colors.success} />
                        <Text style={[styles.cardTitle, { color: theme.colors.text, marginLeft: 8 }]}>
                            Local de Entrega
                        </Text>
                    </View>
                    <Text style={[styles.address, { color: theme.colors.textSecondary }]}>
                        {activeOrder.deliveryAddress}
                    </Text>
                    <View style={[styles.customerInfo, { borderTopColor: theme.colors.border }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Cliente:</Text>
                            <Text style={[styles.value, { color: theme.colors.text }]}>
                                {activeOrder.customerName}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Telefone:</Text>
                            <Text style={[styles.value, { color: theme.colors.text }]}>
                                {activeOrder.customerPhone}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.mapButton, { backgroundColor: theme.colors.surface }]}
                    >
                        <Ionicons name="map-outline" size={16} color={theme.colors.primary} />
                        <Text style={[styles.mapButtonText, { color: theme.colors.primary }]}>
                            Abrir no Mapa
                        </Text>
                    </TouchableOpacity>
                </Card>

                {/* Action Buttons */}
                {!isPickedUp ? (
                    <Button
                        title="Confirmar Coleta"
                        onPress={handlePickup}
                        fullWidth
                        variant="primary"
                    />
                ) : (
                    <Button
                        title="Finalizar Entrega"
                        onPress={handleComplete}
                        fullWidth
                        variant="primary"
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 6,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
    },
    price: {
        fontWeight: '700',
    },
    address: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    customerInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        gap: 8,
    },
    mapButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
