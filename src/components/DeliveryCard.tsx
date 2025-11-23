import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryHistoryItem } from '../types/history';

interface DeliveryCardProps {
    delivery: DeliveryHistoryItem;
    onPress?: () => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onPress }) => {
    const [expanded, setExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;

        Animated.timing(animation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setExpanded(!expanded);
        onPress?.();
    };

    const detailsHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 280],
    });

    const rotateIcon = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'COMPLETED':
                return '#22C55E';
            case 'CANCELLED':
                return '#EF4444';
            case 'DISCARDED':
                return '#F59E0B';
            case 'RETURNED':
                return '#3B82F6';
            default:
                return '#6B7280';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'COMPLETED':
                return 'Concluída';
            case 'CANCELLED':
                return 'Cancelada';
            case 'DISCARDED':
                return 'Descartada';
            case 'RETURNED':
                return 'Devolvida';
            default:
                return status;
        }
    };

    const formatDate = (date: Date): string => {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    const statusColor = getStatusColor(delivery.status);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={toggleExpand}
            activeOpacity={0.7}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <View style={styles.headerInfo}>
                    <Text style={styles.establishmentName} numberOfLines={1}>
                        {delivery.establishmentName}
                    </Text>
                    <Text style={styles.date}>{formatDate(delivery.completedAt)}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.earnings}>
                        R$ {delivery.driverEarnings.toFixed(2)}
                    </Text>
                    <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                        <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </Animated.View>
                </View>
            </View>

            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.addressRow}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.address} numberOfLines={1}>
                        {delivery.deliveryAddress}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {getStatusLabel(delivery.status)}
                    </Text>
                </View>
            </View>

            {/* Expanded Details */}
            <Animated.View style={[styles.details, { height: detailsHeight, overflow: 'hidden' }]}>
                <View style={styles.divider} />

                {/* Locations */}
                <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Localizações</Text>

                    <View style={styles.locationItem}>
                        <View style={styles.locationIcon}>
                            <Ionicons name="storefront" size={16} color="#6366F1" />
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationLabel}>Origem</Text>
                            <Text style={styles.locationAddress} numberOfLines={2}>
                                {delivery.pickupLocation?.address || delivery.establishmentAddress}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.locationItem}>
                        <View style={styles.locationIcon}>
                            <Ionicons name="home" size={16} color="#22C55E" />
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationLabel}>Destino</Text>
                            <Text style={styles.locationAddress} numberOfLines={2}>
                                {delivery.deliveryLocation?.address || delivery.deliveryAddress}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Financial Details */}
                <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Detalhes Financeiros</Text>

                    <View style={styles.financialRow}>
                        <Text style={styles.financialLabel}>Valor da Entrega</Text>
                        <Text style={styles.financialValue}>
                            R$ {delivery.amount.toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.financialRow}>
                        <Text style={styles.financialLabel}>Taxa da Plataforma (15%)</Text>
                        <Text style={[styles.financialValue, { color: '#EF4444' }]}>
                            - R$ {delivery.platformFee.toFixed(2)}
                        </Text>
                    </View>

                    <View style={[styles.financialRow, styles.financialTotal]}>
                        <Text style={styles.financialTotalLabel}>Você Recebeu</Text>
                        <Text style={styles.financialTotalValue}>
                            R$ {delivery.driverEarnings.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Trip Details */}
                <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Detalhes da Corrida</Text>

                    <View style={styles.tripStats}>
                        <View style={styles.tripStat}>
                            <Ionicons name="time-outline" size={20} color="#6B7280" />
                            <Text style={styles.tripStatLabel}>Tempo</Text>
                            <Text style={styles.tripStatValue}>
                                {formatDuration(delivery.duration)}
                            </Text>
                        </View>

                        <View style={styles.tripStat}>
                            <Ionicons name="navigate-outline" size={20} color="#6B7280" />
                            <Text style={styles.tripStatLabel}>Distância</Text>
                            <Text style={styles.tripStatValue}>
                                {delivery.distance ? `${delivery.distance.toFixed(1)} km` : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.tripStat}>
                            <Ionicons name="trophy-outline" size={20} color="#6B7280" />
                            <Text style={styles.tripStatLabel}>Score</Text>
                            <Text style={styles.tripStatValue}>
                                +{delivery.scoreGained || 1}
                            </Text>
                        </View>

                        {delivery.rating && (
                            <View style={styles.tripStat}>
                                <Ionicons name="star" size={20} color="#F59E0B" />
                                <Text style={styles.tripStatLabel}>Avaliação</Text>
                                <Text style={styles.tripStatValue}>
                                    {delivery.rating.toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    establishmentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    date: {
        fontSize: 13,
        color: '#6B7280',
    },
    headerRight: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 8,
    },
    earnings: {
        fontSize: 18,
        fontWeight: '700',
        color: '#22C55E',
    },
    summary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    address: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    details: {
        paddingHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    detailSection: {
        marginBottom: 16,
    },
    detailSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    locationItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    locationAddress: {
        fontSize: 14,
        color: '#1F2937',
    },
    financialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    financialLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    financialValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    financialTotal: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 8,
        marginTop: 4,
    },
    financialTotalLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    financialTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#22C55E',
    },
    tripStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    tripStat: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    tripStatLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    tripStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 2,
    },
});

export default DeliveryCard;
