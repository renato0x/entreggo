import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'DocumentUpload'>;

interface DocumentState {
    uri: string | null;
    uploaded: boolean;
}

export const DocumentUploadScreen = ({ navigation }: Props) => {
    const { theme } = useTheme();
    const { user } = useAuthStore();

    const [cnhFront, setCnhFront] = useState<DocumentState>({ uri: null, uploaded: false });
    const [cnhBack, setCnhBack] = useState<DocumentState>({ uri: null, uploaded: false });
    const [vehiclePhoto, setVehiclePhoto] = useState<DocumentState>({ uri: null, uploaded: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickImage = async (
        setter: React.Dispatch<React.SetStateAction<DocumentState>>,
        documentName: string
    ) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão Negada', 'Precisamos de permissão para acessar suas fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setter({ uri: result.assets[0].uri, uploaded: false });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const takePhoto = async (
        setter: React.Dispatch<React.SetStateAction<DocumentState>>,
        documentName: string
    ) => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão Negada', 'Precisamos de permissão para usar a câmera.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setter({ uri: result.assets[0].uri, uploaded: false });
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto');
        }
    };

    const showImageOptions = (
        setter: React.Dispatch<React.SetStateAction<DocumentState>>,
        documentName: string
    ) => {
        Alert.alert(
            'Adicionar Foto',
            'Escolha uma opção',
            [
                { text: 'Câmera', onPress: () => takePhoto(setter, documentName) },
                { text: 'Galeria', onPress: () => pickImage(setter, documentName) },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleSubmit = async () => {
        if (!cnhFront.uri || !cnhBack.uri || !vehiclePhoto.uri) {
            Alert.alert('Documentos Incompletos', 'Por favor, envie todos os documentos necessários.');
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Implement actual upload to backend
            // await profileService.uploadDocument({ ... });

            // Simulate upload
            await new Promise(resolve => setTimeout(resolve, 2000));

            Alert.alert(
                'Documentos Enviados!',
                'Seus documentos foram enviados para análise. Você será notificado quando for aprovado.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to pending approval or login
                            navigation.navigate('Login');
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error uploading documents:', error);
            Alert.alert('Erro', 'Não foi possível enviar os documentos. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDocumentCard = (
        title: string,
        description: string,
        state: DocumentState,
        setter: React.Dispatch<React.SetStateAction<DocumentState>>,
        icon: keyof typeof Ionicons.glyphMap
    ) => (
        <Card elevated style={{ marginBottom: theme.spacing.md }}>
            <View style={styles.cardHeader}>
                <Ionicons name={icon} size={24} color={theme.colors.primary} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
                    <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                        {description}
                    </Text>
                </View>
            </View>

            {state.uri ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: state.uri }} style={styles.image} />
                    <TouchableOpacity
                        style={[styles.changeButton, { backgroundColor: theme.colors.surface }]}
                        onPress={() => showImageOptions(setter, title)}
                    >
                        <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
                        <Text style={[styles.changeButtonText, { color: theme.colors.primary }]}>
                            Alterar
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.uploadButton, { borderColor: theme.colors.border }]}
                    onPress={() => showImageOptions(setter, title)}
                >
                    <Ionicons name="cloud-upload-outline" size={32} color={theme.colors.textTertiary} />
                    <Text style={[styles.uploadButtonText, { color: theme.colors.textSecondary }]}>
                        Toque para adicionar foto
                    </Text>
                </TouchableOpacity>
            )}
        </Card>
    );

    const allDocumentsUploaded = cnhFront.uri && cnhBack.uri && vehiclePhoto.uri;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Enviar Documentos
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Precisamos validar seus documentos antes de você começar
                    </Text>
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: theme.colors.primary,
                                    width: `${((cnhFront.uri ? 1 : 0) + (cnhBack.uri ? 1 : 0) + (vehiclePhoto.uri ? 1 : 0)) * 33.33}%`,
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                        {(cnhFront.uri ? 1 : 0) + (cnhBack.uri ? 1 : 0) + (vehiclePhoto.uri ? 1 : 0)} de 3 documentos
                    </Text>
                </View>

                {/* Documents */}
                {renderDocumentCard(
                    'CNH - Frente',
                    'Foto da frente da sua CNH',
                    cnhFront,
                    setCnhFront,
                    'card-outline'
                )}

                {renderDocumentCard(
                    'CNH - Verso',
                    'Foto do verso da sua CNH',
                    cnhBack,
                    setCnhBack,
                    'card-outline'
                )}

                {renderDocumentCard(
                    'Foto do Veículo',
                    'Foto clara do seu veículo',
                    vehiclePhoto,
                    setVehiclePhoto,
                    'bicycle-outline'
                )}

                {/* Submit Button */}
                <Button
                    title={isSubmitting ? 'Enviando...' : 'Enviar Documentos'}
                    onPress={handleSubmit}
                    disabled={!allDocumentsUploaded || isSubmitting}
                    loading={isSubmitting}
                    fullWidth
                    style={{ marginTop: theme.spacing.md }}
                />

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: theme.spacing.md, alignItems: 'center' }}
                >
                    <Text style={[styles.backText, { color: theme.colors.textTertiary }]}>
                        Voltar
                    </Text>
                </TouchableOpacity>
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
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        textAlign: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    changeButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    changeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    uploadButton: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadButtonText: {
        fontSize: 14,
        marginTop: 8,
    },
    backText: {
        fontSize: 14,
    },
});
