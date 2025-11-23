import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUI } from '../../hooks';
import { profileService } from '../../services/profileService';
import { DriverProfile } from '../../types/profile';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

import { formatPhone } from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen = ({ navigation }: Props) => {
    const { user } = useAuth();
    const { showSuccess, showError } = useUI();
    const { theme } = useTheme();

    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getProfile();
            setProfile(data);
            setName(data.name);
            setPhone(data.phone || '');
            setDateOfBirth(data.dateOfBirth || '');
            setVehicleModel(data.vehicleModel || '');
            setVehiclePlate(data.vehiclePlate || '');
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar o perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showError('Erro', 'Nome é obrigatório');
            return;
        }

        try {
            setSaving(true);
            await profileService.updateProfile({
                name: name.trim(),
                phone: phone || undefined,
                dateOfBirth: dateOfBirth || undefined,
                vehicleModel: vehicleModel || undefined,
                vehiclePlate: vehiclePlate || undefined,
            });
            showSuccess('Sucesso', 'Perfil atualizado com sucesso!');
            navigation.goBack();
        } catch (error: any) {
            showError('Erro', error.response?.data?.message || 'Erro ao salvar perfil');
        } finally {
            setSaving(false);
        }
    };

    const handlePhoneChange = (text: string) => {
        const formatted = formatPhone(text);
        setPhone(formatted);
    };

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
                    Editar Perfil
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Personal Information */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    INFORMAÇÕES PESSOAIS
                </Text>
                <View style={styles.formSection}>
                    <Input
                        label="Nome Completo"
                        value={name}
                        onChangeText={setName}
                        placeholder="Seu nome completo"
                        icon="person-outline"
                    />

                    <Input
                        label="Email"
                        value={user?.email || ''}
                        editable={false}
                        icon="mail-outline"
                    />

                    <Input
                        label="Telefone"
                        value={phone}
                        onChangeText={handlePhoneChange}
                        placeholder="(11) 98765-4321"
                        keyboardType="phone-pad"
                        icon="call-outline"
                    />

                    <Input
                        label="Data de Nascimento"
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                        placeholder="DD/MM/AAAA"
                        keyboardType="numeric"
                        icon="calendar-outline"
                    />
                </View>

                {/* Vehicle Information */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    INFORMAÇÕES DO VEÍCULO
                </Text>
                <View style={styles.formSection}>
                    <Input
                        label="Modelo do Veículo"
                        value={vehicleModel}
                        onChangeText={setVehicleModel}
                        placeholder="Ex: Honda CG 160"
                        icon="car-outline"
                    />

                    <Input
                        label="Placa do Veículo"
                        value={vehiclePlate}
                        onChangeText={setVehiclePlate}
                        placeholder="ABC-1234"
                        autoCapitalize="characters"
                        icon="card-outline"
                    />
                </View>

                {/* Save Button */}
                <Button
                    title="Salvar Alterações"
                    onPress={handleSave}
                    loading={saving}
                    fullWidth
                    style={{ marginBottom: 32 }}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    formSection: {
        marginBottom: 24,
    },
});
