import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUI } from '../../hooks';
import { profileService } from '../../services/profileService';
import { DriverProfile } from '../../types/profile';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';

export const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { showError } = useUI();
    const { theme } = useTheme();

    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await profileService.getProfile();
            setProfile(data);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar o perfil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadProfile();
        setIsRefreshing(false);
    };

    const getStatusColor = () => {
        switch (profile?.approvalStatus) {
            case 'approved':
                return theme.colors.success;
            case 'rejected':
                return theme.colors.error;
            case 'pending':
                return theme.colors.warning;
            default:
                return theme.colors.textTertiary;
        }
    };

    const getStatusText = () => {
        switch (profile?.approvalStatus) {
            case 'approved':
                return 'Aprovado';
            case 'rejected':
                return 'Rejeitado';
            case 'pending':
                return 'Em Análise';
            default:
                return 'Incompleto';
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
                <Text style={[styles.errorText, { color: theme.colors.text }]}>
                    Erro ao carregar perfil
                </Text>
                <TouchableOpacity onPress={loadProfile} style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Settings Button */}
            <View style={styles.topBar}>
                <Text style={[styles.screenTitle, { color: theme.colors.text }]}>Perfil</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Settings' as never)}
                    style={[styles.settingsIconButton, { backgroundColor: theme.colors.surface }]}
                >
                    <Ionicons name="settings-outline" size={22} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Driver Info Card */}
            <Card elevated style={{ marginBottom: theme.spacing.lg }}>
                <View style={styles.driverHeader}>
                    <View style={[styles.avatarLarge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {profile.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.driverInfo}>
                        <Text style={[styles.driverName, { color: theme.colors.text }]}>
                            {profile.name}
                        </Text>
                        <Text style={[styles.driverEmail, { color: theme.colors.textSecondary }]}>
                            {user?.email}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                {getStatusText()}
                            </Text>
                        </View>
                    </View>
                </View>
            </Card>

            {/* Stats Overview */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                ESTATÍSTICAS
            </Text>
            <View style={styles.statsGrid}>
                <Card elevated style={styles.statCard}>
                    <Ionicons name="bicycle" size={28} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {profile.totalDeliveries || 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Entregas
                    </Text>
                </Card>

                <Card elevated style={styles.statCard}>
                    <Ionicons name="star" size={28} color={theme.colors.warning} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {profile.rating?.toFixed(1) || '0.0'}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Avaliação
                    </Text>
                </Card>

                <Card elevated style={styles.statCard}>
                    <Ionicons name="cash" size={28} color={theme.colors.success} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        R$ {(profile.totalEarnings || 0).toFixed(0)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Ganhos
                    </Text>
                </Card>

                <Card elevated style={styles.statCard}>
                    <Ionicons name="trophy" size={28} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {profile.score || 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Pontos
                    </Text>
                </Card>
            </View>

            {/* Contact Information */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                INFORMAÇÕES DE CONTATO
            </Text>
            <Card elevated style={{ marginBottom: theme.spacing.lg }}>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                            Telefone
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                            {profile.phone || 'Não informado'}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                            Email
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                            {user?.email}
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Vehicle Information */}
            {profile.vehicleType && (
                <>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                        VEÍCULO
                    </Text>
                    <Card elevated style={{ marginBottom: theme.spacing.lg }}>
                        <View style={styles.infoRow}>
                            <Ionicons name="car-outline" size={20} color={theme.colors.primary} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                    Tipo de Veículo
                                </Text>
                                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                    {profile.vehicleType}
                                </Text>
                            </View>
                        </View>
                    </Card>
                </>
            )}

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                AÇÕES RÁPIDAS
            </Text>
            <Card elevated style={{ marginBottom: theme.spacing.xl }}>
                <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => navigation.navigate('History' as never)}
                >
                    <View style={styles.actionLeft}>
                        <Ionicons name="time-outline" size={22} color={theme.colors.primary} />
                        <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
                            Ver Histórico
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => navigation.navigate('Settings' as never)}
                >
                    <View style={styles.actionLeft}>
                        <Ionicons name="settings-outline" size={22} color={theme.colors.primary} />
                        <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
                            Configurações
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    screenTitle: {
        fontSize: 32,
        fontWeight: '700',
    },
    settingsIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    driverInfo: {
        flex: 1,
    },
    driverName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    driverEmail: {
        fontSize: 14,
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 28,
        marginTop: 8,
        letterSpacing: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statCard: {
        width: '47%',
        margin: '1.5%',
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoContent: {
        marginLeft: 16,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
});
