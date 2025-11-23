import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUI } from '../../hooks';
import { profileService } from '../../services/profileService';
import { DriverProfile } from '../../types/profile';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';

export const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const logout = useAuthStore((state) => state.logout);
    const { showSuccess, showError } = useUI();
    const { theme } = useTheme();

    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await profileService.getProfile();
            setProfile(data);
        } catch (error: any) {
            console.error('Erro ao carregar perfil', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadProfile();
        setIsRefreshing(false);
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: logout },
            ]
        );
    };

    const MenuItem = ({ icon, label, onPress, badge, color }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon} size={24} color={color || theme.colors.text} />
                <Text style={[styles.menuItemLabel, { color: theme.colors.text }]}>{label}</Text>
            </View>
            <View style={styles.menuItemRight}>
                {badge && (
                    <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                        {profile?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.userName, { color: theme.colors.text }]}>
                        {profile?.name || user?.name || 'Usuário'}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('EditProfile' as never)}>
                        <Text style={[styles.userAction, { color: theme.colors.primary }]}>
                            Editar perfil {'>'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Banner */}
            <TouchableOpacity style={[styles.banner, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.bannerIcon, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="star" size={24} color="#FFF" />
                </View>
                <View style={styles.bannerContent}>
                    <Text style={[styles.bannerTitle, { color: theme.colors.text }]}>Parceiro Entreggo</Text>
                    <Text style={[styles.bannerSubtitle, { color: theme.colors.textSecondary }]}>
                        Seus pedidos valem pontos e vantagens exclusivas
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>

            {/* Menu */}
            <View style={styles.menuContainer}>
                <MenuItem
                    icon="notifications-outline"
                    label="Notificações"
                    onPress={() => navigation.navigate('NotificationSettings' as never)}
                    badge={2}
                />
                <MenuItem
                    icon="person-outline"
                    label="Dados da conta"
                    onPress={() => navigation.navigate('EditProfile' as never)}
                />
                <MenuItem
                    icon="wallet-outline"
                    label="Carteira"
                    onPress={() => showSuccess('Em breve', 'Funcionalidade em desenvolvimento')}
                />
                <MenuItem
                    icon="list-outline"
                    label="Categorias de Entrega"
                    onPress={() => navigation.navigate('Categories' as never)}
                />
                <MenuItem
                    icon="settings-outline"
                    label="Configurações"
                    onPress={() => navigation.navigate('Settings' as never)}
                />
                <MenuItem
                    icon="help-circle-outline"
                    label="Ajuda"
                    onPress={() => showSuccess('Em breve', 'Funcionalidade em desenvolvimento')}
                />
            </View>

            <View style={styles.footer}>
                <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
                    Versão 1.0.0
                </Text>
            </View>
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    userAction: {
        fontSize: 14,
        fontWeight: '500',
    },
    banner: {
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bannerIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bannerContent: {
        flex: 1,
        marginRight: 8,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 12,
        lineHeight: 16,
    },
    menuContainer: {
        paddingHorizontal: 24,
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
    menuItemLabel: {
        fontSize: 16,
        marginLeft: 16,
        fontWeight: '500',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    version: {
        fontSize: 12,
    },
});
