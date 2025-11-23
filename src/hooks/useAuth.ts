import { useAuthStore } from '../store/authStore';
import { User } from '../types/auth';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
export const useAuth = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);

    const setUser = useAuthStore((state) => state.setUser);
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
    const setLoading = useAuthStore((state) => state.setLoading);
    const setError = useAuthStore((state) => state.setError);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    return {
        // State
        isAuthenticated,
        user,
        token: useAuthStore((state) => state.token),
        isLoading,
        error,

        // Computed
        isApproved: user?.status === 'approved',
        isPending: user?.status === 'pending',
        isRejected: user?.status === 'rejected',

        // Actions
        setUser,
        setAuthenticated,
        setLoading,
        setError,
        login,
        logout,
        checkAuth,
    };
};
