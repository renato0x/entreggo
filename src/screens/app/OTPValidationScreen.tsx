import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Keyboard,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { otpService } from '../../services/otpService';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPValidation'>;

export const OTPValidationScreen = ({ route, navigation }: Props) => {
    const { orderId } = route.params;

    const [code, setCode] = useState(['', '', '', '']);
    const [isValidating, setIsValidating] = useState(false);
    const [attemptsRemaining, setAttemptsRemaining] = useState(3);
    const [errorMessage, setErrorMessage] = useState('');

    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    useEffect(() => {
        // Focus first input on mount
        inputRefs[0].current?.focus();
    }, []);

    const handleCodeChange = (value: string, index: number) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setErrorMessage('');

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }

        // Auto-submit when all 4 digits are entered
        if (index === 3 && value) {
            const fullCode = newCode.join('');
            if (fullCode.length === 4) {
                handleValidate(fullCode);
            }
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleValidate = async (fullCode?: string) => {
        const codeToValidate = fullCode || code.join('');

        if (codeToValidate.length !== 4) {
            setErrorMessage('Digite os 4 dígitos do código');
            return;
        }

        try {
            setIsValidating(true);
            Keyboard.dismiss();

            const result = await otpService.validateOTP({
                orderId,
                code: codeToValidate,
            });

            if (result.valid) {
                // Success! Navigate to success screen
                navigation.replace('DeliverySuccess', { orderId });
            } else {
                // Invalid code
                setErrorMessage(result.message);
                setAttemptsRemaining(result.attemptsRemaining || 0);

                // Clear code
                setCode(['', '', '', '']);
                inputRefs[0].current?.focus();

                if (result.attemptsRemaining === 0) {
                    Alert.alert(
                        'Código Bloqueado',
                        'Número máximo de tentativas excedido. Entre em contato com o suporte.',
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.goBack(),
                            },
                        ]
                    );
                }
            }
        } catch (error: any) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível validar o código.'
            );
        } finally {
            setIsValidating(false);
        }
    };

    const handleResendCode = async () => {
        try {
            const sent = await otpService.resendOTP(orderId);
            if (sent) {
                Alert.alert('Sucesso', 'Código reenviado para o cliente via WhatsApp.');
            } else {
                Alert.alert('Erro', 'Não foi possível reenviar o código.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível reenviar o código.');
        }
    };

    const isCodeComplete = code.every(digit => digit !== '');

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={60} color="#007AFF" />
                    </View>
                    <Text style={styles.title}>Código de Confirmação</Text>
                    <Text style={styles.subtitle}>
                        Solicite o código de 4 dígitos ao cliente para confirmar a entrega
                    </Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={inputRefs[index]}
                            style={[
                                styles.otpInput,
                                digit && styles.otpInputFilled,
                                errorMessage && styles.otpInputError,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleCodeChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            editable={!isValidating && attemptsRemaining > 0}
                        />
                    ))}
                </View>

                {/* Error Message */}
                {errorMessage && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color="#EF4444" />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                {/* Attempts Remaining */}
                {attemptsRemaining < 3 && attemptsRemaining > 0 && (
                    <Text style={styles.attemptsText}>
                        ⚠️ {attemptsRemaining} tentativa(s) restante(s)
                    </Text>
                )}

                {/* Validate Button */}
                <TouchableOpacity
                    style={[
                        styles.validateButton,
                        (!isCodeComplete || isValidating) && styles.disabledButton,
                    ]}
                    onPress={() => handleValidate()}
                    disabled={!isCodeComplete || isValidating}
                >
                    {isValidating ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                            <Text style={styles.validateButtonText}>Confirmar Código</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Resend Button */}
                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendCode}
                    disabled={isValidating}
                >
                    <Ionicons name="refresh" size={20} color="#007AFF" />
                    <Text style={styles.resendText}>Reenviar código via WhatsApp</Text>
                </TouchableOpacity>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        O código foi enviado para o WhatsApp do cliente quando você confirmou a retirada
                    </Text>
                </View>
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
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    otpInput: {
        width: 60,
        height: 70,
        borderWidth: 2,
        borderColor: '#DDD',
        borderRadius: 12,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        backgroundColor: '#FFF',
    },
    otpInputFilled: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F9FF',
    },
    otpInputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    attemptsText: {
        textAlign: 'center',
        color: '#F59E0B',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    validateButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
    validateButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 6,
    },
    resendText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#F0F9FF',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});
