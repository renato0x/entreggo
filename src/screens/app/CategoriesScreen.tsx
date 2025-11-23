import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUI } from '../../hooks';
import { categoryService } from '../../services/categoryService';
import { Category, DriverCategory } from '../../types/store';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const CategoriesScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { showSuccess, showError } = useUI();

    const [categories, setCategories] = useState<Category[]>([]);
    const [myCategories, setMyCategories] = useState<DriverCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cats, myCats] = await Promise.all([
                categoryService.getCategories(),
                categoryService.getMyCategories(),
            ]);
            setCategories(cats);
            setMyCategories(myCats);
        } catch (error) {
            console.error(error);
            showError('Erro', 'Não foi possível carregar as categorias');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleApply = async (categoryId: string) => {
        try {
            setProcessingId(categoryId);
            await categoryService.applyForCategory(categoryId);
            showSuccess('Sucesso', 'Solicitação enviada com sucesso!');
            await loadData();
        } catch (error: any) {
            showError('Erro', error.response?.data?.message || 'Erro ao solicitar categoria');
        } finally {
            setProcessingId(null);
        }
    };

    const getCategoryStatus = (categoryId: string) => {
        const myCat = myCategories.find(c => c.categoryId === categoryId);
        return myCat?.status || null;
    };

    const renderStatusBadge = (status: string | null) => {
        if (!status) return null;

        let color = theme.colors.textTertiary;
        let text = '';
        let icon = '';

        switch (status) {
            case 'approved':
                color = theme.colors.success;
                text = 'Aprovado';
                icon = 'checkmark-circle';
                break;
            case 'pending':
                color = theme.colors.warning;
                text = 'Em Análise';
                icon = 'time';
                break;
            case 'rejected':
                color = theme.colors.error;
                text = 'Rejeitado';
                icon = 'close-circle';
                break;
        }

        return (
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={16} color={color} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color }]}>{text}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Categorias de Entrega
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    Solicite verificação nas categorias abaixo para receber pedidos específicos.
                </Text>

                <View style={styles.menuContainer}>
                    {categories.map((category) => {
                        const status = getCategoryStatus(category.id);
                        const isProcessing = processingId === category.id;

                        return (
                            <View key={category.id}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => !status && handleApply(category.id)}
                                    disabled={!!status || isProcessing}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
                                            <Ionicons name={category.icon as any || 'cube'} size={24} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.menuItemTextContainer}>
                                            <Text style={[styles.menuItemLabel, { color: theme.colors.text }]}>
                                                {category.name}
                                            </Text>
                                            {status ? (
                                                renderStatusBadge(status)
                                            ) : (
                                                <Text style={[styles.availableText, { color: theme.colors.textSecondary }]}>
                                                    Toque para solicitar
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.menuItemRight}>
                                        {isProcessing ? (
                                            <ActivityIndicator size="small" color={theme.colors.primary} />
                                        ) : (
                                            !status && <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
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
    header: {
        marginBottom: 24,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 16,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    description: {
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
        paddingHorizontal: 24,
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
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemTextContainer: {
        flex: 1,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    availableText: {
        fontSize: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
    },
});
