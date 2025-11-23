import { create } from 'zustand';
import { Location, LocationState, LocationHistory } from '../types/store';

interface LocationActions {
    setCurrentLocation: (location: Location) => void;
    startTracking: () => void;
    stopTracking: () => void;
    addLocationToHistory: (location: Location) => void;
    clearLocationHistory: () => void;
    setError: (error: string | null) => void;
}

type LocationStore = LocationState & LocationActions;

export const useLocationStore = create<LocationStore>((set, get) => ({
    // Initial State
    currentLocation: null,
    isTracking: false,
    locationHistory: [],
    error: null,

    // Actions
    setCurrentLocation: (location) => {
        set({ currentLocation: location, error: null });

        // Auto-add to history if tracking
        if (get().isTracking) {
            get().addLocationToHistory(location);
        }
    },

    startTracking: () => {
        set({ isTracking: true, error: null });
    },

    stopTracking: () => {
        set({ isTracking: false });
    },

    addLocationToHistory: (location) => {
        const history: LocationHistory = {
            id: `loc_${Date.now()}`,
            location,
            createdAt: new Date().toISOString(),
        };

        set((state) => ({
            locationHistory: [...state.locationHistory, history].slice(-100), // Keep last 100
        }));
    },

    clearLocationHistory: () => {
        set({ locationHistory: [] });
    },

    setError: (error) => {
        set({ error });
    },
}));
