import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ActionSheetIOS,
    Platform,
} from 'react-native';
import { imagePickerService } from '../services/imagePickerService';
import { DocumentStatus } from '../types/profile';

interface DocumentUploadProps {
    title: string;
    documentType: 'cnh_front' | 'cnh_back' | 'vehicle_photo';
    imageUrl?: string;
    status: DocumentStatus;
    rejectionReason?: string;
    onUpload: (uri: string, fileName: string) => Promise<void>;
    onDelete?: () => Promise<void>;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
    title,
    documentType,
    imageUrl,
    status,
    rejectionReason,
    onUpload,
    onDelete,
}) => {
    const [localImageUri, setLocalImageUri] = useState<string | undefined>(imageUrl);
    const [isUploading, setIsUploading] = useState(false);

    const getStatusColor = () => {
        switch (status) {
            case 'approved':
                return '#34C759';
            case 'rejected':
                return '#FF3B30';
            case 'pending':
                return '#FF9500';
            default:
                return '#8E8E93';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'approved':
                return '✓ Aprovado';
            case 'rejected':
                return '✗ Rejeitado';
            case 'pending':
                return '⏳ Em análise';
            default:
                return 'Não enviado';
        }
    };

    const handlePickImage = async (source: 'camera' | 'gallery') => {
        try {
            setIsUploading(true);

            let asset;
            if (source === 'camera') {
                asset = await imagePickerService.pickFromCamera();
            } else {
                asset = await imagePickerService.pickFromGallery();
            }

            if (!asset) {
                setIsUploading(false);
                return;
            }

            // Validate size
            if (!imagePickerService.validateImageSize(asset.fileSize)) {
                Alert.alert('Erro', 'A imagem é muito grande. Tamanho máximo: 5MB');
                setIsUploading(false);
                return;
            }

            // Compress image
            const compressedUri = await imagePickerService.compressImage(asset.uri);
            const fileName = imagePickerService.generateFileName(documentType);

            // Update local preview
            setLocalImageUri(compressedUri);

            // Upload
            await onUpload(compressedUri, fileName);

            Alert.alert('Sucesso', 'Documento enviado com sucesso!');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao fazer upload do documento');
            setLocalImageUri(imageUrl); // Revert to original
        } finally {
            setIsUploading(false);
        }
    };

    const showImagePicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        handlePickImage('camera');
                    } else if (buttonIndex === 2) {
                        handlePickImage('gallery');
                    }
                }
            );
        } else {
            Alert.alert('Escolher Imagem', 'De onde deseja escolher a imagem?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Câmera', onPress: () => handlePickImage('camera') },
                { text: 'Galeria', onPress: () => handlePickImage('gallery') },
            ]);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;

        Alert.alert('Confirmar', 'Deseja remover este documento?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Remover',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await onDelete();
                        setLocalImageUri(undefined);
                        Alert.alert('Sucesso', 'Documento removido');
                    } catch (error) {
                        Alert.alert('Erro', 'Não foi possível remover o documento');
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
            </View>

            {rejectionReason && (
                <View style={styles.rejectionBox}>
                    <Text style={styles.rejectionText}>Motivo: {rejectionReason}</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.uploadArea}
                onPress={showImagePicker}
                disabled={isUploading || status === 'approved'}
            >
                {isUploading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : localImageUri ? (
                    <Image source={{ uri: localImageUri }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderIcon}>📷</Text>
                        <Text style={styles.placeholderText}>Toque para adicionar foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            {localImageUri && status !== 'approved' && (
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.changeButton} onPress={showImagePicker}>
                        <Text style={styles.changeButtonText}>Alterar Foto</Text>
                    </TouchableOpacity>
                    {onDelete && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>Remover</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    rejectionBox: {
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    rejectionText: {
        color: '#C62828',
        fontSize: 14,
    },
    uploadArea: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    placeholderText: {
        fontSize: 14,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    changeButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    changeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
