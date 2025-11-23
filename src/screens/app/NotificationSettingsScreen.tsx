import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationSettings } from '../../types/notification';

export const NotificationSettingsScreen = () => {
    const { settings, hasPermission, requestPermissions, updateSettings } = useNotifications();
    const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
        const updated = { ...localSettings, [key]: value };
        setLocalSettings(updated);
        updateSettings({ [key]: value });
    };

    const handleTypeToggle = (
        type: keyof NotificationSettings['notificationTypes'],
        value: boolean
    ) => {
        const updated = {
            ...localSettings,
            notificationTypes: {
                ...localSettings.notificationTypes,
                [type]: value,
            },
        };
        setLocalSettings(updated);
        updateSettings({
            notificationTypes: updated.notificationTypes,
        });
    };

    const handleQuietHoursChange = (type: 'start' | 'end', value: string) => {
        const key = type === 'start' ? 'quietHoursStart' : 'quietHoursEnd';
        const updated = { ...localSettings, [key]: value };
        setLocalSettings(updated);
        updateSettings({ [key]: value });
    };

    const handleRequestPermission = async () => {
        const granted = await requestPermissions();
        if (!granted) {
            Alert.alert(
                'Permissão Negada',
                'Habilite as notificações nas configurações do dispositivo para receber alertas de novos pedidos.',
                [
                    { text: 'OK' },
                    {
                        text: 'Abrir Configurações',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                // Linking.openURL('app-settings:');
                            } else {
                                // Linking.openSettings();
                            }
                        },
                    },
                ]
            );
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Permission Status */}
            {!hasPermission && (
                <View style={styles.permissionBanner}>
                    <Text style={styles.permissionText}>
                        ⚠️ Notificações desabilitadas. Você não receberá alertas de novos pedidos.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
                        <Text style={styles.permissionButtonText}>Habilitar Notificações</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* General Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Geral</Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Notificações</Text>
                        <Text style={styles.settingDescription}>
                            Receber notificações push
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.enabled}
                        onValueChange={(value) => handleToggle('enabled', value)}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Som</Text>
                        <Text style={styles.settingDescription}>
                            Reproduzir som ao receber notificação
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.sound}
                        onValueChange={(value) => handleToggle('sound', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Vibração</Text>
                        <Text style={styles.settingDescription}>
                            Vibrar ao receber notificação
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.vibration}
                        onValueChange={(value) => handleToggle('vibration', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Badge</Text>
                        <Text style={styles.settingDescription}>
                            Exibir número de notificações no ícone
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.badge}
                        onValueChange={(value) => handleToggle('badge', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>
            </View>

            {/* Quiet Hours */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Horário de Silêncio</Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Ativar Horário de Silêncio</Text>
                        <Text style={styles.settingDescription}>
                            Não receber notificações durante este período
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.quietHoursEnabled}
                        onValueChange={(value) => handleToggle('quietHoursEnabled', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>

                {localSettings.quietHoursEnabled && (
                    <View style={styles.timeContainer}>
                        <View style={styles.timeRow}>
                            <Text style={styles.timeLabel}>Início:</Text>
                            <Text style={styles.timeValue}>{localSettings.quietHoursStart}</Text>
                        </View>
                        <View style={styles.timeRow}>
                            <Text style={styles.timeLabel}>Fim:</Text>
                            <Text style={styles.timeValue}>{localSettings.quietHoursEnd}</Text>
                        </View>
                        <Text style={styles.timeHint}>
                            Toque para alterar os horários (funcionalidade em desenvolvimento)
                        </Text>
                    </View>
                )}
            </View>

            {/* Notification Types */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipos de Notificações</Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Novos Pedidos</Text>
                        <Text style={styles.settingDescription}>
                            Alertas de pedidos disponíveis próximos
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.notificationTypes.newOrder}
                        onValueChange={(value) => handleTypeToggle('newOrder', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Pedido Aceito</Text>
                        <Text style={styles.settingDescription}>
                            Quando outro entregador aceita um pedido
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.notificationTypes.orderAccepted}
                        onValueChange={(value) => handleTypeToggle('orderAccepted', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Pedido Cancelado</Text>
                        <Text style={styles.settingDescription}>
                            Quando um pedido é cancelado
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.notificationTypes.orderCancelled}
                        onValueChange={(value) => handleTypeToggle('orderCancelled', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Mensagens do Suporte</Text>
                        <Text style={styles.settingDescription}>
                            Comunicados e mensagens importantes
                        </Text>
                    </View>
                    <Switch
                        value={localSettings.notificationTypes.supportMessage}
                        onValueChange={(value) => handleTypeToggle('supportMessage', value)}
                        disabled={!localSettings.enabled}
                        trackColor={{ false: '#ccc', true: '#34C759' }}
                    />
                </View>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    💡 Dica: Mantenha as notificações de novos pedidos ativadas para não perder
                    oportunidades de entrega!
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    permissionBanner: {
        backgroundColor: '#FFF3CD',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#FFE69C',
    },
    permissionText: {
        fontSize: 14,
        color: '#856404',
        marginBottom: 12,
    },
    permissionButton: {
        backgroundColor: '#FFC107',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        color: '#666',
    },
    timeContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
    },
    timeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    timeHint: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 8,
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        margin: 16,
        padding: 16,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#1976D2',
        lineHeight: 20,
    },
});
