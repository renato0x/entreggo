import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';

export const PendingApprovalScreen = () => {
    const { theme } = useTheme();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Deseja realmente sair? Você pode voltar quando seu cadastro for aprovado.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: () => logout(),
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                    <Ionicons name="time-outline" size={64} color={theme.colors.warning} />
                </View>

                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Aguardando Aprovação
                </Text>

                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    Seu cadastro está sendo analisado pela nossa equipe. Você será notificado assim que for aprovado.
                </Text>

                <Card elevated style={{ marginTop: theme.spacing.xl }}>
                    <View style={styles.infoRow}>
                        <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                            Cadastro enviado com sucesso
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    <View style={styles.infoRow}>
                        <Ionicons name="document-text-outline" size={24} color={theme.colors.info} />
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                            Documentos em análise
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    <View style={styles.infoRow}>
                        <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                            Você receberá uma notificação
                        </Text>
                    </View>
                </Card>

                <Button
                    title="Sair"
                    onPress={handleLogout}
                    variant="outline"
                    fullWidth
                    style={{ marginTop: 24 }}
                />

                <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
                    Dúvidas? Entre em contato com o suporte
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoText: {
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    helpText: {
        fontSize: 14,
        marginTop: 32,
        textAlign: 'center',
    },
});
