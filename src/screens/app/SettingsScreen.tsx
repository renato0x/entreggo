import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props) => {
    const { theme, themeMode, toggleTheme } = useTheme();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const handleLogout = () => {
        logout();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
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
                        Configurações
                    </Text>
                </View>

                {/* User Info */}
                <Card elevated style={{ marginBottom: theme.spacing.lg }}>
                    <View style={styles.userInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="person" size={32} color={theme.colors.primary} />
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={[styles.userName, { color: theme.colors.text }]}>
                                {user?.name || 'Usuário'}
                            </Text>
                            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                                {user?.email || 'email@exemplo.com'}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    APARÊNCIA
                </Text>
                <Card elevated style={{ marginBottom: theme.spacing.lg }}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons
                                name={themeMode === 'dark' ? 'moon' : 'sunny'}
                                size={24}
                                color={theme.colors.primary}
                            />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                                    Modo Escuro
                                </Text>
                                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                                    {themeMode === 'dark' ? 'Ativado' : 'Desativado'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={themeMode === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </Card>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    CONTA
                </Text>
                <Card elevated style={{ marginBottom: theme.spacing.lg }}>
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => navigation.navigate('NotificationSettings')}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                                    Notificações
                                </Text>
                                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                                    Gerenciar preferências
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                                    Privacidade
                                </Text>
                                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                                    Dados e segurança
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                </Card>

                {/* Support Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    SUPORTE
                </Text>
                <Card elevated style={{ marginBottom: theme.spacing.lg }}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                                    Central de Ajuda
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                                    Termos de Uso
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                </Card>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.colors.error + '15' }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
                    <Text style={[styles.logoutText, { color: theme.colors.error }]}>
                        Sair da Conta
                    </Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
                    Versão 1.0.0
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 16,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    version: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
    },
});
