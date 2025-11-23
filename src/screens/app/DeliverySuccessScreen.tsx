import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { trackingService } from '../services/trackingService';
import Confetti from 'react-native-confetti';

type Props = NativeStackScreenProps<RootStackParamList, 'DeliverySuccess'>;

export const DeliverySuccessScreen = ({ route, navigation }: Props) => {
    const { orderId } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [earnings, setEarnings] = useState(0);
    const [scoreGained, setScoreGained] = useState(0);
    const [receipt, setReceipt] = useState<any>(null);

    const confettiRef = React.useRef<any>(null);

    useEffect(() => {
        completeDelivery();
    }, []);

    const completeDelivery = async () => {
        try {
            setIsLoading(true);

            // Call complete delivery endpoint
            const response = await fetch(`/orders/${orderId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth token
                },
            });

            const data = await response.json();

            setEarnings(data.earnings);
            setScoreGained(data.scoreGained);
            setReceipt(data.receipt);

            // Trigger confetti
            confettiRef.current?.startConfetti();

            // Stop confetti after 3 seconds
            setTimeout(() => {
                confettiRef.current?.stopConfetti();
            }, 3000);
        } catch (error) {
            console.error('Error completing delivery:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToMap = () => {
        // Navigate back to home/map screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'App' }],
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Finalizando entrega...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Confetti ref={confettiRef} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.successCircle}>
                        <Ionicons name="checkmark" size={80} color="#FFF" />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Entrega Concluída!</Text>
                <Text style={styles.subtitle}>
                    Parabéns! Você completou mais uma entrega com sucesso.
                </Text>

                {/* Earnings Card */}
                <View style={styles.earningsCard}>
                    <View style={styles.earningsHeader}>
                        <Ionicons name="wallet" size={24} color="#22C55E" />
                        <Text style={styles.earningsLabel}>Você Recebeu</Text>
                    </View>
                    <Text style={styles.earningsValue}>R$ {earnings.toFixed(2)}</Text>
                    <Text style={styles.earningsSubtext}>
                        O valor será creditado em sua carteira
                    </Text>
                </View>

                {/* Score Card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreRow}>
                        <View style={styles.scoreItem}>
                            <Ionicons name="star" size={32} color="#F59E0B" />
                            <Text style={styles.scoreValue}>+{scoreGained}</Text>
                            <Text style={styles.scoreLabel}>Pontos</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.scoreItem}>
                            <Ionicons name="trophy" size={32} color="#007AFF" />
                            <Text style={styles.scoreValue}>100%</Text>
                            <Text style={styles.scoreLabel}>Taxa de Sucesso</Text>
                        </View>
                    </View>
                </View>

                {/* Receipt Info */}
                {receipt && (
                    <View style={styles.receiptCard}>
                        <Text style={styles.receiptTitle}>Comprovante</Text>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Pedido</Text>
                            <Text style={styles.receiptValue}>#{receipt.orderId.slice(0, 8)}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Concluído em</Text>
                            <Text style={styles.receiptValue}>
                                {new Date(receipt.completedAt).toLocaleString('pt-BR')}
                            </Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Entregador</Text>
                            <Text style={styles.receiptValue}>{receipt.driverName}</Text>
                        </View>
                    </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackToMap}
                >
                    <Ionicons name="map" size={24} color="#FFF" />
                    <Text style={styles.backButtonText}>Voltar ao Mapa</Text>
                </TouchableOpacity>

                {/* Motivational Message */}
                <View style={styles.messageBox}>
                    <Ionicons name="heart" size={20} color="#EF4444" />
                    <Text style={styles.messageText}>
                        Continue assim! Cada entrega é uma oportunidade de fazer alguém feliz.
                    </Text>
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
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 40,
        marginBottom: 24,
    },
    successCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#22C55E',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    earningsCard: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    earningsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    earningsLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    earningsValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#22C55E',
        marginBottom: 8,
    },
    earningsSubtext: {
        fontSize: 13,
        color: '#999',
    },
    scoreCard: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    scoreItem: {
        alignItems: 'center',
        flex: 1,
    },
    divider: {
        width: 1,
        height: 60,
        backgroundColor: '#E5E5E5',
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    scoreLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    receiptCard: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderStyle: 'dashed',
    },
    receiptTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    receiptLabel: {
        fontSize: 14,
        color: '#666',
    },
    receiptValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    backButton: {
        width: '100%',
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 12,
        width: '100%',
    },
    messageText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});
