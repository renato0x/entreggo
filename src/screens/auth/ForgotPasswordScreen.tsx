import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validation';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { theme } = useTheme();

    const validateForm = (): boolean => {
        if (!email) {
            setError('Email é obrigatório');
            return false;
        }
        if (!validateEmail(email)) {
            setError('Email inválido');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await authService.forgotPassword({ email: email.trim().toLowerCase() });

            Alert.alert(
                'Email Enviado!',
                'Verifique sua caixa de entrada para redefinir sua senha.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Forgot password error:', error);
            const errorMessage = error.response?.data?.message ||
                (error.message === 'Network Error' ? 'Erro de conexão. Verifique se o backend está rodando.' : 'Erro ao enviar email. Tente novamente.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>

                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="lock-closed-outline" size={48} color={theme.colors.primary} />
                        </View>

                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            Recuperar Senha
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Digite seu email e enviaremos instruções para redefinir sua senha
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={[styles.form, { marginTop: theme.spacing.xl }]}>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) setError('');
                            }}
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            icon="mail-outline"
                            error={error}
                        />

                        <Button
                            title="Enviar Email"
                            onPress={handleSubmit}
                            loading={loading}
                            fullWidth
                            style={{ marginTop: theme.spacing.md }}
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            style={styles.backLink}
                            disabled={loading}
                        >
                            <Text style={[styles.backLinkText, { color: theme.colors.textSecondary }]}>
                                Voltar para{' '}
                                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                    Login
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    form: {},
    backLink: {
        marginTop: 24,
        alignItems: 'center',
        padding: 12,
    },
    backLinkText: {
        fontSize: 14,
    },
});
