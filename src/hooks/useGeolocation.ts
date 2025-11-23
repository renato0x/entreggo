import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Alert, Linking, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useLocationStore } from '../store/locationStore';
import { locationService } from '../services/locationService';
import { Location } from '../types/store';

const UPDATE_INTERVAL = 10000; // 10 seconds
const RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceFilter?: number;
}

export const useGeolocation = (options?: UseGeolocationOptions) => {
    const {
        currentLocation,
        isTracking,
        setCurrentLocation,
        startTracking,
        stopTracking,
        setError,
    } = useLocationStore();

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const watchIdRef = useRef<number | null>(null);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const appState = useRef(AppState.currentState);
    const pendingLocationsRef = useRef<Location[]>([]);

    /**
     * Check if location permission is granted
     */
    const checkPermission = async (): Promise<boolean> => {
        try {
            if (!Geolocation || !Geolocation.getCurrentPosition) {
                console.warn('Geolocation not available (Expo Go)');
                setHasPermission(false);
                return false;
            }

            if (Platform.OS === 'ios') {
                if (!Geolocation.requestAuthorization) {
                    console.warn('Geolocation.requestAuthorization not available');
                    setHasPermission(false);
                    return false;
                }
                const status = await Geolocation.requestAuthorization('whenInUse');
                const granted = status === 'granted';
                setHasPermission(granted);
                return granted;
            } else {
                // Android - check permission
                const result = await new Promise<boolean>((resolve) => {
                    Geolocation.getCurrentPosition(
                        () => resolve(true),
                        (error) => {
                            if (error.code === 1) {
                                resolve(false); // Permission denied
                            } else {
                                resolve(true); // Other error, assume permission granted
                            }
                        },
                        { timeout: 1000 }
                    );
                });
                setHasPermission(result);
                return result;
            }
        } catch (error) {
            console.error('Error checking permission:', error);
            setHasPermission(false);
            return false;
        }
    };

    /**
     * Request location permission
     */
    const requestPermission = async (): Promise<boolean> => {
        if (isRequestingPermission) return false;

        setIsRequestingPermission(true);
        try {
            const granted = await checkPermission();

            if (!granted) {
                Alert.alert(
                    'Permissão de Localização',
                    'O Entreggo precisa acessar sua localização para funcionar corretamente. Por favor, habilite nas configurações.',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Abrir Configurações',
                            onPress: () => Linking.openSettings(),
                        },
                    ]
                );
            }

            return granted;
        } finally {
            setIsRequestingPermission(false);
        }
    };

    /**
     * Get current position
     */
    const getCurrentPosition = async (): Promise<Location | null> => {
        if (!Geolocation || !Geolocation.getCurrentPosition) {
            console.warn('Geolocation.getCurrentPosition not available');
            return null;
        }

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const location: Location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                    };
                    resolve(location);
                },
                (error) => {
                    console.error('Error getting position:', error);
                    setError(error.message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: options?.enableHighAccuracy ?? true,
                    timeout: options?.timeout ?? 15000,
                    maximumAge: options?.maximumAge ?? 10000,
                }
            );
        });
    };

    /**
     * Send location to backend with retry
     */
    const sendLocationToBackend = async (location: Location, retry = 0) => {
        try {
            await locationService.updateLocation({
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || 0,
                timestamp: location.timestamp,
                speed: 0, // TODO: Get from position.coords.speed
            });

            // Clear retry count on success
            setRetryCount(0);

            // Send any pending locations
            if (pendingLocationsRef.current.length > 0) {
                await locationService.batchUpdateLocations(
                    pendingLocationsRef.current.map((loc) => ({
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        accuracy: loc.accuracy || 0,
                        timestamp: loc.timestamp,
                    }))
                );
                pendingLocationsRef.current = [];
            }
        } catch (error) {
            console.error('Error sending location to backend:', error);

            if (retry < MAX_RETRIES) {
                // Retry after delay
                setTimeout(() => {
                    sendLocationToBackend(location, retry + 1);
                }, RETRY_DELAY);
                setRetryCount(retry + 1);
            } else {
                // Store for batch update later
                pendingLocationsRef.current.push(location);
                setError('Erro ao enviar localização. Tentando novamente...');
            }
        }
    };

    /**
     * Start watching position
     */
    const startWatchingPosition = async () => {
        if (!Geolocation || !Geolocation.watchPosition) {
            console.warn('Geolocation.watchPosition not available (Expo Go)');
            setError('Localização não disponível no Expo Go');
            return;
        }

        const permitted = await checkPermission();
        if (!permitted) {
            await requestPermission();
            return;
        }

        // Get initial position
        const initialPosition = await getCurrentPosition();
        if (initialPosition) {
            setCurrentLocation(initialPosition);
            sendLocationToBackend(initialPosition);
        }

        // Start watching
        watchIdRef.current = Geolocation.watchPosition(
            (position) => {
                const location: Location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                };

                setCurrentLocation(location);
            },
            (error) => {
                console.error('Watch position error:', error);
                setError(error.message);
            },
            {
                enableHighAccuracy: options?.enableHighAccuracy ?? true,
                distanceFilter: options?.distanceFilter ?? 10, // Update every 10 meters
                interval: UPDATE_INTERVAL,
                fastestInterval: 5000,
            }
        );

        // Start interval for backend updates
        updateIntervalRef.current = setInterval(async () => {
            if (currentLocation) {
                await sendLocationToBackend(currentLocation);
            }
        }, UPDATE_INTERVAL);

        startTracking();
    };

    /**
     * Stop watching position
     */
    const stopWatchingPosition = () => {
        if (watchIdRef.current !== null && Geolocation && Geolocation.clearWatch) {
            Geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
        }

        stopTracking();
    };

    /**
     * Handle app state changes
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App came to foreground
                if (isTracking) {
                    startWatchingPosition();
                }
            } else if (nextAppState.match(/inactive|background/)) {
                // App went to background
                stopWatchingPosition();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isTracking]);

    /**
     * Initialize on mount
     */
    useEffect(() => {
        checkPermission();

        return () => {
            stopWatchingPosition();
        };
    }, []);

    return {
        currentLocation,
        isTracking,
        hasPermission,
        isRequestingPermission,
        retryCount,
        startTracking: startWatchingPosition,
        stopTracking: stopWatchingPosition,
        requestPermission,
        getCurrentPosition,
    };
};
