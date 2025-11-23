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
import { useAuthStore } from '../../store/authStore';
import { validateEmail } from '../../utils/validation';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const login = useAuthStore((state) => state.login);
    const { theme } = useTheme();

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email inválido';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            login(response.user, response.token);

            if (response.user.status === 'pending') {
                Alert.alert(
                    'Aguardando Aprovação',
                    'Seu cadastro está sendo analisado. Você será notificado quando for aprovado.'
                );
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
            Alert.alert('Erro', errorMessage);
        } finally {
            setIsLoading(false);
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
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            Bem-vindo
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Entre para continuar
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={[styles.form, { marginTop: theme.spacing.xl }]}>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            icon="mail-outline"
                            error={errors.email}
                        />

                        <Input
                            label="Senha"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Sua senha"
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={{ alignSelf: 'flex-end', marginTop: -theme.spacing.sm }}
                        >
                            <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                                Esqueceu a senha?
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title="Entrar"
                            onPress={handleLogin}
                            loading={isLoading}
                            fullWidth
                            style={{ marginTop: theme.spacing.lg }}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                            Não tem uma conta?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                                Cadastre-se
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {},
    forgotPassword: {
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
