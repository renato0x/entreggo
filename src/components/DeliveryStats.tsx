import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryStats } from '../types/history';

interface DeliveryStatsProps {
    stats: DeliveryStats;
}

const DeliveryStatsComponent: React.FC<DeliveryStatsProps> = ({ stats }) => {
    return (
        <View style={styles.container}>
            {/* Main Stats */}
            <View style={styles.mainStatsContainer}>
                <View style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                        <Ionicons name="checkmark-circle" size={28} color="#6366F1" />
                    </View>
                    <Text style={styles.statValue}>{stats.totalDeliveries}</Text>
                    <Text style={styles.statLabel}>Total de Entregas</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                        <Ionicons name="cash" size={28} color="#22C55E" />
                    </View>
                    <Text style={styles.statValue}>R$ {stats.totalEarnings.toFixed(2)}</Text>
                    <Text style={styles.statLabel}>Total Ganho</Text>
                </View>
            </View>

            {/* Secondary Stats */}
            <View style={styles.secondaryStatsContainer}>
                <View style={styles.secondaryStatCard}>
                    <View style={styles.secondaryStatHeader}>
                        <Ionicons name="star" size={20} color="#F59E0B" />
                        <Text style={styles.secondaryStatLabel}>Avaliação Média</Text>
                    </View>
                    <Text style={styles.secondaryStatValue}>
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                    </Text>
                </View>

                <View style={styles.secondaryStatCard}>
                    <View style={styles.secondaryStatHeader}>
                        <Ionicons name="trending-up" size={20} color="#3B82F6" />
                        <Text style={styles.secondaryStatLabel}>Taxa de Conclusão</Text>
                    </View>
                    <Text style={styles.secondaryStatValue}>
                        {stats.completionRate.toFixed(0)}%
                    </Text>
                </View>
            </View>

            {/* Period Stats */}
            <View style={styles.periodStatsContainer}>
                <View style={styles.periodStatCard}>
                    <Text style={styles.periodLabel}>Esta Semana</Text>
                    <View style={styles.periodValues}>
                        <Text style={styles.periodDeliveries}>
                            {stats.weeklyDeliveries} entregas
                        </Text>
                        <Text style={styles.periodEarnings}>
                            R$ {stats.weeklyEarnings.toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={styles.periodDivider} />

                <View style={styles.periodStatCard}>
                    <Text style={styles.periodLabel}>Este Mês</Text>
                    <View style={styles.periodValues}>
                        <Text style={styles.periodDeliveries}>
                            {stats.monthlyDeliveries} entregas
                        </Text>
                        <Text style={styles.periodEarnings}>
                            R$ {stats.monthlyEarnings.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    mainStatsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },
    secondaryStatsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    secondaryStatCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryStatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    secondaryStatLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    secondaryStatValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    periodStatsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    periodStatCard: {
        flex: 1,
    },
    periodDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    periodLabel: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 8,
    },
    periodValues: {
        gap: 4,
    },
    periodDeliveries: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    periodEarnings: {
        fontSize: 18,
        fontWeight: '700',
        color: '#22C55E',
    },
});

export default DeliveryStatsComponent;
