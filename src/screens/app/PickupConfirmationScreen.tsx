import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
    Clipboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { otpService } from '../../services/otpService';
import * as Linking from 'expo-linking';

type Props = NativeStackScreenProps<RootStackParamList, 'PickupConfirmation'>;

export const PickupConfirmationScreen = ({ route, navigation }: Props) => {
    const { orderId, establishmentName } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [otpCode, setOtpCode] = useState<string | null>(null);
    const [whatsappSent, setWhatsappSent] = useState(false);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    const handleConfirmPickup = async () => {
        Alert.alert(
            'Confirmar Retirada',
            'Você retirou todos os itens do estabelecimento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const result = await otpService.startDelivery(orderId);

                            setOtpCode(result.otpCode);
                            setWhatsappSent(result.whatsappSent);
                            setExpiresAt(result.expiresAt);

                            if (!result.whatsappSent) {
                                Alert.alert(
                                    'Atenção',
                                    'Não foi possível enviar o código por WhatsApp. Compartilhe manualmente com o cliente.'
                                );
                            }
                        } catch (error: any) {
                            Alert.alert(
                                'Erro',
                                error.response?.data?.message || 'Não foi possível confirmar a retirada.'
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleCopyCode = () => {
        if (otpCode) {
            Clipboard.setString(otpCode);
            Alert.alert('Copiado!', 'Código copiado para a área de transferência.');
        }
    };

    const handleShareWhatsApp = async () => {
        if (!otpCode) return;

        const message = `Olá! Sou o entregador da ${establishmentName}. Para receber sua encomenda, por favor informe este código: *${otpCode}*`;

        try {
            await Share.share({
                message,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleContinueToDelivery = () => {
        navigation.replace('DeliveryDetails', { orderId });
    };

    if (otpCode) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
                    </View>

                    <Text style={styles.title}>Retirada Confirmada!</Text>
                    <Text style={styles.subtitle}>
                        Compartilhe este código com o cliente para confirmar a entrega
                    </Text>

                    {/* OTP Code Display */}
                    <View style={styles.otpContainer}>
                        <Text style={styles.otpLabel}>Código de Confirmação</Text>
                        <View style={styles.otpCodeBox}>
                            <Text style={styles.otpCode}>{otpCode}</Text>
                        </View>
                        <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                            <Ionicons name="copy-outline" size={20} color="#007AFF" />
                            <Text style={styles.copyText}>Copiar Código</Text>
                        </TouchableOpacity>
                    </View>

                    {/* WhatsApp Status */}
                    {whatsappSent ? (
                        <View style={styles.statusBox}>
                            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                            <Text style={styles.statusText}>WhatsApp enviado com sucesso!</Text>
                        </View>
                    ) : (
                        <View style={[styles.statusBox, styles.warningBox]}>
                            <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                            <Text style={styles.warningText}>
                                WhatsApp não enviado. Compartilhe manualmente.
                            </Text>
                        </View>
                    )}

                    {/* Expiration Info */}
                    {expiresAt && (
                        <Text style={styles.expirationText}>
                            ⏰ Código expira em {new Date(expiresAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    )}

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={handleShareWhatsApp}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
                            <Text style={styles.shareButtonText}>Compartilhar via WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinueToDelivery}
                        >
                            <Text style={styles.continueButtonText}>Continuar para Entrega</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="cube-outline" size={80} color="#007AFF" />
                </View>

                <Text style={styles.title}>Confirmar Retirada</Text>
                <Text style={styles.subtitle}>
                    Você está em <Text style={styles.bold}>{establishmentName}</Text>
                </Text>

                <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle" size={24} color="#007AFF" />
                        <Text style={styles.infoText}>
                            Ao confirmar, um código será gerado e enviado ao cliente via WhatsApp
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="shield-checkmark" size={24} color="#22C55E" />
                        <Text style={styles.infoText}>
                            O cliente precisará informar este código para receber a encomenda
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={24} color="#F59E0B" />
                        <Text style={styles.infoText}>
                            O código expira em 1 hora
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, isLoading && styles.disabledButton]}
                    onPress={handleConfirmPickup}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                            <Text style={styles.confirmButtonText}>Confirmar Retirada</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    successContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
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
    },
    bold: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    infoBox: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        gap: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    otpContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    otpLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    otpCodeBox: {
        backgroundColor: '#F0F9FF',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 48,
        marginBottom: 12,
    },
    otpCode: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#007AFF',
        letterSpacing: 8,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    copyText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    warningBox: {
        backgroundColor: '#FEF3C7',
    },
    statusText: {
        color: '#22C55E',
        fontSize: 14,
        fontWeight: '600',
    },
    warningText: {
        color: '#F59E0B',
        fontSize: 14,
        fontWeight: '600',
    },
    expirationText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 24,
    },
    actionsContainer: {
        width: '100%',
        gap: 12,
    },
    shareButton: {
        backgroundColor: '#25D366',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    continueButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
