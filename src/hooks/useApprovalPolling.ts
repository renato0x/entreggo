import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { profileService } from '../services/profileService';
import { useAuth } from './useAuth';

const POLLING_INTERVAL = 30000; // 30 seconds

interface ApprovalStatus {
    status: 'pending' | 'approved' | 'rejected' | 'incomplete';
    cnhStatus: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
    vehicleStatus: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
    rejectionReasons?: {
        cnh?: string;
        vehicle?: string;
    };
}

export const useApprovalPolling = () => {
    const { user, setUser } = useAuth();
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const appState = useRef(AppState.currentState);

    const checkApprovalStatus = async () => {
        try {
            setError(null);
            const status = await profileService.getApprovalStatus();
            setApprovalStatus(status as ApprovalStatus);

            // If approved, update user status
            if (status.status === 'approved' && user) {
                setUser({ ...user, status: 'approved' });
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao verificar status');
            console.error('Error checking approval status:', err);
        }
    };

    const startPolling = () => {
        if (isPolling) return;

        setIsPolling(true);

        // Check immediately
        checkApprovalStatus();

        // Then check every 30 seconds
        intervalRef.current = setInterval(() => {
            checkApprovalStatus();
        }, POLLING_INTERVAL);
    };

    const stopPolling = () => {
        setIsPolling(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        // Handle app state changes (pause polling when app is in background)
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App came to foreground, check status immediately
                if (isPolling) {
                    checkApprovalStatus();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isPolling]);

    useEffect(() => {
        // Start polling when user is pending
        if (user?.status === 'pending') {
            startPolling();
        } else {
            stopPolling();
        }

        // Cleanup on unmount
        return () => {
            stopPolling();
        };
    }, [user?.status]);

    return {
        approvalStatus,
        isPolling,
        error,
        checkApprovalStatus,
        startPolling,
        stopPolling,
    };
};
