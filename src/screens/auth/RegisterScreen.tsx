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
import { validateEmail, validatePassword, validatePhone, formatPhone } from '../../utils/validation';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
}

export const RegisterScreen = ({ navigation }: Props) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const { theme } = useTheme();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const { name, email, phone, password, confirmPassword } = formData;

        if (!name.trim()) {
            newErrors.name = 'Nome completo é obrigatório';
        } else if (name.trim().length < 3) {
            newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        }

        if (!email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email inválido';
        }

        if (!phone) {
            newErrors.phone = 'Telefone é obrigatório';
        } else if (!validatePhone(phone)) {
            newErrors.phone = 'Telefone inválido';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                newErrors.password = passwordValidation.errors[0];
            }
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        if (!acceptedTerms) {
            newErrors.terms = 'Você deve aceitar os termos de uso';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await authService.register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            Alert.alert(
                'Cadastro Realizado!',
                'Agora envie seus documentos para análise.',
                [
                    {
                        text: 'Continuar',
                        onPress: () => navigation.navigate('DocumentUpload'),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Registration failed:', error);
            const errorMessage = error.response?.data?.message ||
                (error.message === 'Network Error' ? 'Erro de conexão. Verifique se o backend está rodando.' : 'Erro ao criar conta. Tente novamente.');
            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (text: string) => {
        const formatted = formatPhone(text);
        setFormData({ ...formData, phone: formatted });
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
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            Criar Conta
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Preencha os dados para começar
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={[styles.form, { marginTop: theme.spacing.xl }]}>
                        <Input
                            label="Nome Completo"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Seu nome completo"
                            autoCapitalize="words"
                            icon="person-outline"
                            error={errors.name}
                        />

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            icon="mail-outline"
                            error={errors.email}
                        />

                        <Input
                            label="Telefone"
                            value={formData.phone}
                            onChangeText={handlePhoneChange}
                            placeholder="(11) 98765-4321"
                            keyboardType="phone-pad"
                            icon="call-outline"
                            error={errors.phone}
                        />

                        <Input
                            label="Senha"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            placeholder="Mínimo 6 caracteres"
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        <Input
                            label="Confirmar Senha"
                            value={formData.confirmPassword}
                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                            placeholder="Digite a senha novamente"
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        {/* Terms Checkbox */}
                        <TouchableOpacity
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                            style={styles.termsContainer}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    {
                                        borderColor: errors.terms ? theme.colors.error : theme.colors.border,
                                        backgroundColor: acceptedTerms ? theme.colors.primary : 'transparent',
                                    },
                                ]}
                            >
                                {acceptedTerms && (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                )}
                            </View>
                            <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                                Aceito os{' '}
                                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                    termos de uso
                                </Text>
                                {' '}e{' '}
                                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                    política de privacidade
                                </Text>
                            </Text>
                        </TouchableOpacity>
                        {errors.terms && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                {errors.terms}
                            </Text>
                        )}

                        <Button
                            title="Criar Conta"
                            onPress={handleRegister}
                            loading={loading}
                            fullWidth
                            style={{ marginTop: theme.spacing.lg }}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                            Já tem uma conta?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                                Entrar
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
        marginBottom: 16,
    },
    backButton: {
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
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
        marginBottom: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
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
