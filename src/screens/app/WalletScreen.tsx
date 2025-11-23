import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import walletService from '../../services/walletService';
import { WalletSummary, WalletTransaction } from '../../types/wallet';
import TransactionList from '../../components/TransactionList';
import WithdrawModal from '../../components/WithdrawModal';

const WalletScreen: React.FC = () => {
    const [summary, setSummary] = useState<WalletSummary | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

    const limit = 20;

    const loadWalletData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
                setOffset(0);
            } else {
                setLoading(true);
            }

            // Load summary
            const summaryData = await walletService.getWalletSummary();
            setSummary(summaryData);

            // Load transactions
            const { transactions: txData, pagination } = await walletService.getTransactions({
                limit,
                offset: isRefresh ? 0 : offset,
            });

            if (isRefresh) {
                setTransactions(txData);
            } else {
                setTransactions(prev => offset === 0 ? txData : [...prev, ...txData]);
            }

            setHasMore(pagination.hasMore);
        } catch (error) {
            console.error('Error loading wallet data:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da carteira.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadMoreTransactions = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const newOffset = offset + limit;

            const { transactions: txData, pagination } = await walletService.getTransactions({
                limit,
                offset: newOffset,
            });

            setTransactions(prev => [...prev, ...txData]);
            setOffset(newOffset);
            setHasMore(pagination.hasMore);
        } catch (error) {
            console.error('Error loading more transactions:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleWithdraw = async (amount: number, bankAccount?: string, notes?: string) => {
        await walletService.requestWithdrawal({ amount, bankAccount, notes });
        setWithdrawModalVisible(false);
        loadWalletData(true);
    };

    useEffect(() => {
        loadWalletData();
    }, []);

    const onRefresh = useCallback(() => {
        loadWalletData(true);
    }, []);

    if (loading && !summary) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Minha Carteira</Text>
                    <TouchableOpacity style={styles.historyButton}>
                        <Ionicons name="time-outline" size={24} color="#6366F1" />
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Ionicons name="wallet" size={32} color="#6366F1" />
                        <Text style={styles.balanceLabel}>Saldo Disponível</Text>
                    </View>
                    <Text style={styles.balanceAmount}>
                        R$ {summary?.balance.toFixed(2) || '0,00'}
                    </Text>
                    <TouchableOpacity
                        style={styles.withdrawButton}
                        onPress={() => setWithdrawModalVisible(true)}
                    >
                        <Ionicons name="cash-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.withdrawButtonText}>Solicitar Saque</Text>
                    </TouchableOpacity>
                </View>

                {/* Earnings Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="calendar-outline" size={24} color="#22C55E" />
                        </View>
                        <Text style={styles.summaryLabel}>Esta Semana</Text>
                        <Text style={styles.summaryAmount}>
                            R$ {summary?.weeklyEarnings.toFixed(2) || '0,00'}
                        </Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="stats-chart-outline" size={24} color="#3B82F6" />
                        </View>
                        <Text style={styles.summaryLabel}>Este Mês</Text>
                        <Text style={styles.summaryAmount}>
                            R$ {summary?.monthlyEarnings.toFixed(2) || '0,00'}
                        </Text>
                    </View>
                </View>

                {/* Total Earnings */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Ganho</Text>
                        <Text style={styles.statValue}>
                            R$ {summary?.totalEarnings.toFixed(2) || '0,00'}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Sacado</Text>
                        <Text style={styles.statValue}>
                            R$ {summary?.totalWithdrawals.toFixed(2) || '0,00'}
                        </Text>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.transactionsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Transações Recentes</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver Todas</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.length > 0 ? (
                        <View style={styles.transactionsContainer}>
                            <TransactionList
                                transactions={transactions.slice(0, 10)}
                                loading={loadingMore}
                                hasMore={hasMore}
                                onLoadMore={loadMoreTransactions}
                            />
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
                            <Text style={styles.emptySubtext}>
                                Complete entregas para começar a ganhar
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Withdraw Modal */}
            <WithdrawModal
                visible={withdrawModalVisible}
                onClose={() => setWithdrawModalVisible(false)}
                balance={summary?.balance || 0}
                minAmount={50}
                onWithdraw={handleWithdraw}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
    },
    historyButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#6B7280',
        marginLeft: 12,
        fontWeight: '500',
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 20,
    },
    withdrawButton: {
        flexDirection: 'row',
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    withdrawButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    transactionsSection: {
        flex: 1,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
    },
    transactionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        padding: 48,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default WalletScreen;
