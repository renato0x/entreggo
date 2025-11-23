import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WalletTransaction, TransactionType } from '../types/wallet';
import { Ionicons } from '@expo/vector-icons';

interface TransactionListProps {
    transactions: WalletTransaction[];
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    onTransactionPress?: (transaction: WalletTransaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
    transactions,
    loading = false,
    onLoadMore,
    hasMore = false,
    onTransactionPress,
}) => {
    const getTransactionIcon = (type: TransactionType): string => {
        switch (type) {
            case TransactionType.DELIVERY_COMPLETED:
                return 'checkmark-circle';
            case TransactionType.DELIVERY_CANCELLED:
                return 'close-circle';
            case TransactionType.WITHDRAWAL_REQUESTED:
            case TransactionType.WITHDRAWAL_PROCESSED:
                return 'cash';
            case TransactionType.REFUND:
                return 'return-up-back';
            case TransactionType.BONUS:
                return 'gift';
            case TransactionType.PENALTY:
                return 'warning';
            default:
                return 'swap-horizontal';
        }
    };

    const getTransactionColor = (amount: number): string => {
        return amount >= 0 ? '#22C55E' : '#EF4444';
    };

    const getTransactionLabel = (type: TransactionType): string => {
        switch (type) {
            case TransactionType.DELIVERY_COMPLETED:
                return 'Entrega Concluída';
            case TransactionType.DELIVERY_CANCELLED:
                return 'Entrega Cancelada';
            case TransactionType.WITHDRAWAL_REQUESTED:
                return 'Saque Solicitado';
            case TransactionType.WITHDRAWAL_PROCESSED:
                return 'Saque Processado';
            case TransactionType.WITHDRAWAL_CANCELLED:
                return 'Saque Cancelado';
            case TransactionType.REFUND:
                return 'Reembolso';
            case TransactionType.BONUS:
                return 'Bônus';
            case TransactionType.PENALTY:
                return 'Penalidade';
            default:
                return 'Transação';
        }
    };

    const formatDate = (date: Date): string => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (d.toDateString() === yesterday.toDateString()) {
            return `Ontem às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return d.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const renderTransaction = ({ item }: { item: WalletTransaction }) => {
        const color = getTransactionColor(item.amount);
        const icon = getTransactionIcon(item.type);
        const label = getTransactionLabel(item.type);

        return (
            <TouchableOpacity
                style={styles.transactionItem}
                onPress={() => onTransactionPress?.(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon as any} size={24} color={color} />
                </View>

                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionLabel}>{label}</Text>
                    <Text style={styles.transactionDescription}>{item.description}</Text>
                    <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.amountContainer}>
                    <Text style={[styles.amount, { color }]}>
                        {item.amount >= 0 ? '+' : ''}R$ {Math.abs(item.amount).toFixed(2)}
                    </Text>
                    {item.withdrawalStatus && (
                        <View style={[styles.statusBadge, getStatusBadgeStyle(item.withdrawalStatus)]}>
                            <Text style={styles.statusText}>{item.withdrawalStatus}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { backgroundColor: '#FEF3C7' };
            case 'PROCESSING':
                return { backgroundColor: '#DBEAFE' };
            case 'PROCESSED':
                return { backgroundColor: '#D1FAE5' };
            case 'CANCELLED':
                return { backgroundColor: '#FEE2E2' };
            default:
                return { backgroundColor: '#F3F4F6' };
        }
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#6366F1" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
                <Text style={styles.emptySubtext}>
                    Suas transações aparecerão aqui
                </Text>
            </View>
        );
    };

    return (
        <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={hasMore ? onLoadMore : undefined}
            onEndReachedThreshold={0.5}
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        flexGrow: 1,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    transactionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#374151',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
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
    },
});

export default TransactionList;
