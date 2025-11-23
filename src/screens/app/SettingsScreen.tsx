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

    const MenuItem = ({ icon, label, onPress, rightElement, color }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon} size={24} color={color || theme.colors.text} />
                <View style={styles.menuItemTextContainer}>
                    <Text style={[styles.menuItemLabel, { color: theme.colors.text }]}>{label}</Text>
                </View>
            </View>
            <View style={styles.menuItemRight}>
                {rightElement}
                {onPress && <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />}
            </View>
        </TouchableOpacity>
    );

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

                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    APARÊNCIA
                </Text>
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon={themeMode === 'dark' ? 'moon' : 'sunny'}
                        label="Modo Escuro"
                        rightElement={
                            <Switch
                                value={themeMode === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <MenuItem
                        icon="list-outline"
                        label="Categorias de Entrega"
                        onPress={() => navigation.navigate('Categories' as never)}
                    />
                </View>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    CONTA
                </Text>
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="notifications-outline"
                        label="Notificações"
                        onPress={() => navigation.navigate('NotificationSettings')}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <MenuItem
                        icon="lock-closed-outline"
                        label="Privacidade"
                        onPress={() => { }}
                    />
                </View>

                {/* Support Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    SUPORTE
                </Text>
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="help-circle-outline"
                        label="Central de Ajuda"
                        onPress={() => { }}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <MenuItem
                        icon="document-text-outline"
                        label="Termos de Uso"
                        onPress={() => { }}
                    />
                </View>

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
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    header: {
        marginBottom: 24,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 28,
        marginTop: 8,
        letterSpacing: 0.5,
    },
    menuContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemTextContainer: {
        marginLeft: 16,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginHorizontal: 24,
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
