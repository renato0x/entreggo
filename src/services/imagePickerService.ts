import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { ImageAsset } from '../types/profile';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESSED_WIDTH = 1024;
const COMPRESSION_QUALITY = 0.8;

export const imagePickerService = {
    /**
     * Request camera permissions
     */
    async requestCameraPermission(): Promise<boolean> {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    },

    /**
     * Request media library permissions
     */
    async requestMediaLibraryPermission(): Promise<boolean> {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
    },

    /**
     * Pick image from camera
     */
    async pickFromCamera(): Promise<ImageAsset | null> {
        const hasPermission = await this.requestCameraPermission();
        if (!hasPermission) {
            throw new Error('Permissão de câmera negada');
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        return result.assets[0] as ImageAsset;
    },

    /**
     * Pick image from gallery
     */
    async pickFromGallery(): Promise<ImageAsset | null> {
        const hasPermission = await this.requestMediaLibraryPermission();
        if (!hasPermission) {
            throw new Error('Permissão de galeria negada');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        return result.assets[0] as ImageAsset;
    },

    /**
     * Compress image to reduce file size
     */
    async compressImage(uri: string): Promise<string> {
        const manipResult = await manipulateAsync(
            uri,
            [{ resize: { width: COMPRESSED_WIDTH } }],
            { compress: COMPRESSION_QUALITY, format: SaveFormat.JPEG }
        );

        return manipResult.uri;
    },

    /**
     * Validate image size
     */
    validateImageSize(fileSize?: number): boolean {
        if (!fileSize) return true;
        return fileSize <= MAX_IMAGE_SIZE;
    },

    /**
     * Get file extension from URI
     */
    getFileExtension(uri: string): string {
        const match = uri.match(/\.(\w+)$/);
        return match ? match[1] : 'jpg';
    },

    /**
     * Generate file name
     */
    generateFileName(documentType: string): string {
        const timestamp = Date.now();
        return `${documentType}_${timestamp}.jpg`;
    },
};
