import { useLocationStore } from '../store/locationStore';
import { useGeolocation } from './useGeolocation';

/**
 * Custom hook for location tracking
 * Provides easy access to location state and actions
 */
export const useLocation = () => {
    const currentLocation = useLocationStore((state) => state.currentLocation);
    const isTracking = useLocationStore((state) => state.isTracking);
    const locationHistory = useLocationStore((state) => state.locationHistory);
    const error = useLocationStore((state) => state.error);

    const setCurrentLocation = useLocationStore((state) => state.setCurrentLocation);
    const startTracking = useLocationStore((state) => state.startTracking);
    const stopTracking = useLocationStore((state) => state.stopTracking);
    const addLocationToHistory = useLocationStore((state) => state.addLocationToHistory);
    const clearLocationHistory = useLocationStore((state) => state.clearLocationHistory);
    const setError = useLocationStore((state) => state.setError);

    // Use geolocation hook for actual GPS functionality
    const geolocation = useGeolocation();

    return {
        // State
        currentLocation,
        isTracking,
        locationHistory,
        error,

        // Computed
        hasLocation: currentLocation !== null,
        lastLocation: locationHistory[locationHistory.length - 1]?.location || null,

        // Actions from store
        setCurrentLocation,
        addLocationToHistory,
        clearLocationHistory,
        setError,

        // Actions from geolocation
        startTracking: geolocation.startTracking,
        stopTracking: geolocation.stopTracking,
        requestPermission: geolocation.requestPermission,
        getCurrentPosition: geolocation.getCurrentPosition,

        // Geolocation state
        hasPermission: geolocation.hasPermission,
        isRequestingPermission: geolocation.isRequestingPermission,
        retryCount: geolocation.retryCount,
    };
};
