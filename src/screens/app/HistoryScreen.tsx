import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import historyService from '../../services/historyService';
import { DeliveryHistoryItem, DeliveryStats } from '../../types/history';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';

export const HistoryScreen: React.FC = () => {
    const { theme } = useTheme();
    const [stats, setStats] = useState<DeliveryStats | null>(null);
    const [deliveries, setDeliveries] = useState<DeliveryHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const limit = 10;

    const loadData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
                setOffset(0);
            } else {
                setLoading(true);
            }

            // Load stats
            const statsData = await historyService.getStats();
            setStats(statsData);

            // Load deliveries
            const { items, pagination } = await historyService.getHistory({
                limit,
                offset: isRefresh ? 0 : offset,
            });

            if (isRefresh) {
                setDeliveries(items);
            } else {
                setDeliveries((prev) => [...prev, ...items]);
            }

            setHasMore(pagination.hasMore);
            setOffset(pagination.offset + items.length);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const { items, pagination } = await historyService.getHistory({
                limit,
                offset,
            });

            setDeliveries((prev) => [...prev, ...items]);
            setHasMore(pagination.hasMore);
            setOffset(offset + items.length);
        } catch (error) {
            console.error('Error loading more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = useCallback(() => {
        loadData(true);
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return theme.colors.success;
            case 'cancelled':
                return theme.colors.error;
            default:
                return theme.colors.textTertiary;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Concluída';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
        }
    };

    const renderDeliveryItem = ({ item }: { item: DeliveryHistoryItem }) => (
        <Card elevated style={{ marginBottom: theme.spacing.md }}>
            <View style={styles.deliveryHeader}>
                <View style={styles.deliveryLeft}>
                    <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
                    <View style={{ marginLeft: theme.spacing.md }}>
                        <Text style={[styles.deliveryId, { color: theme.colors.text }]}>
                            #{item.id.slice(0, 8)}
                        </Text>
                        <Text style={[styles.deliveryDate, { color: theme.colors.textSecondary }]}>
                            {formatDate(item.completedAt)}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.deliveryDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {item.establishmentAddress}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="navigate-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {item.deliveryAddress}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.deliveryFooter}>
                <Text style={[styles.earnings, { color: theme.colors.success }]}>
                    {formatCurrency(item.driverEarnings)}
                </Text>
                <Text style={[styles.distance, { color: theme.colors.textTertiary }]}>
                    {item.distance ? item.distance.toFixed(1) : '0.0'} km
                </Text>
            </View>
        </Card>
    );

    const renderStats = () => {
        if (!stats) return null;

        return (
            <View style={styles.statsContainer}>
                <Card elevated style={{ marginBottom: theme.spacing.md }}>
                    <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
                        Estatísticas
                    </Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {stats.totalDeliveries}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Entregas
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="cash" size={32} color={theme.colors.primary} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {formatCurrency(stats.totalEarnings)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Ganhos
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="navigate" size={32} color={theme.colors.info} />
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {stats.totalDistance ? stats.totalDistance.toFixed(0) : '0'} km
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Distância
                            </Text>
                        </View>
                    </View>
                </Card>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Histórico</Text>
            </View>

            <FlatList
                data={deliveries}
                renderItem={renderDeliveryItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderStats}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 16 }} />
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            Nenhuma entrega no histórico
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    listContent: {
        padding: 16,
    },
    statsContainer: {},
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    deliveryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    deliveryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    deliveryId: {
        fontSize: 16,
        fontWeight: '600',
    },
    deliveryDate: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    deliveryDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        flex: 1,
    },
    deliveryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    earnings: {
        fontSize: 18,
        fontWeight: '700',
    },
    distance: {
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});
