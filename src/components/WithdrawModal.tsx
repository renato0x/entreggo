import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WithdrawModalProps {
    visible: boolean;
    onClose: () => void;
    balance: number;
    minAmount?: number;
    onWithdraw: (amount: number, bankAccount?: string, notes?: string) => Promise<void>;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
    visible,
    onClose,
    balance,
    minAmount = 50,
    onWithdraw,
}) => {
    const [amount, setAmount] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const fee = 0; // No fee for now
    const numericAmount = parseFloat(amount) || 0;
    const finalAmount = numericAmount - fee;

    const handleWithdraw = async () => {
        // Validation
        if (numericAmount < minAmount) {
            Alert.alert(
                'Valor Inválido',
                `O valor mínimo para saque é R$ ${minAmount.toFixed(2)}`
            );
            return;
        }

        if (numericAmount > balance) {
            Alert.alert(
                'Saldo Insuficiente',
                'Você não possui saldo suficiente para este saque.'
            );
            return;
        }

        try {
            setLoading(true);
            await onWithdraw(numericAmount, bankAccount || undefined, notes || undefined);

            // Reset form
            setAmount('');
            setBankAccount('');
            setNotes('');

            Alert.alert(
                'Saque Solicitado',
                'Seu saque foi solicitado com sucesso e será processado em breve.',
                [{ text: 'OK', onPress: onClose }]
            );
        } catch (error: any) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível solicitar o saque. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: string): string => {
        // Remove non-numeric characters
        const numeric = value.replace(/[^0-9]/g, '');

        if (!numeric) return '';

        // Convert to decimal
        const decimal = parseFloat(numeric) / 100;

        return decimal.toFixed(2);
    };

    const handleAmountChange = (text: string) => {
        const formatted = formatCurrency(text);
        setAmount(formatted);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Solicitar Saque</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Balance Info */}
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>Saldo Disponível</Text>
                        <Text style={styles.balanceAmount}>R$ {balance.toFixed(2)}</Text>
                        <Text style={styles.minAmountText}>
                            Valor mínimo: R$ {minAmount.toFixed(2)}
                        </Text>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Valor do Saque</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencySymbol}>R$</Text>
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={handleAmountChange}
                                keyboardType="numeric"
                                placeholder="0,00"
                                placeholderTextColor="#9CA3AF"
                                editable={!loading}
                            />
                        </View>
                        {numericAmount > 0 && numericAmount < minAmount && (
                            <Text style={styles.errorText}>
                                Valor abaixo do mínimo permitido
                            </Text>
                        )}
                        {numericAmount > balance && (
                            <Text style={styles.errorText}>
                                Valor acima do saldo disponível
                            </Text>
                        )}
                    </View>

                    {/* Bank Account Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Conta Bancária (Opcional)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={bankAccount}
                            onChangeText={setBankAccount}
                            placeholder="Banco, Agência, Conta"
                            placeholderTextColor="#9CA3AF"
                            editable={!loading}
                        />
                    </View>

                    {/* Notes Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Observações (Opcional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Adicione observações sobre o saque"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            editable={!loading}
                        />
                    </View>

                    {/* Summary */}
                    {numericAmount > 0 && (
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Valor Solicitado</Text>
                                <Text style={styles.summaryValue}>R$ {numericAmount.toFixed(2)}</Text>
                            </View>
                            {fee > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Taxa</Text>
                                    <Text style={styles.summaryValue}>- R$ {fee.toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={[styles.summaryRow, styles.summaryTotal]}>
                                <Text style={styles.summaryTotalLabel}>Você Receberá</Text>
                                <Text style={styles.summaryTotalValue}>R$ {finalAmount.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.withdrawButton,
                                (loading || numericAmount < minAmount || numericAmount > balance) &&
                                styles.disabledButton,
                            ]}
                            onPress={handleWithdraw}
                            disabled={loading || numericAmount < minAmount || numericAmount > balance}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.withdrawButtonText}>Solicitar Saque</Text>
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
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    balanceCard: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    minAmountText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        paddingVertical: 16,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
        marginTop: 8,
        marginBottom: 0,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#22C55E',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    withdrawButton: {
        backgroundColor: '#6366F1',
    },
    withdrawButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
    },
});

export default WithdrawModal;
