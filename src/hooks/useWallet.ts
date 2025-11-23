import { useWalletStore } from '../store/walletStore';

/**
 * Custom hook for wallet management
 * Provides easy access to wallet state and actions
 */
export const useWallet = () => {
    const wallet = useWalletStore((state) => state.wallet);
    const isLoading = useWalletStore((state) => state.isLoading);
    const error = useWalletStore((state) => state.error);

    const setWallet = useWalletStore((state) => state.setWallet);
    const addTransaction = useWalletStore((state) => state.addTransaction);
    const updateBalance = useWalletStore((state) => state.updateBalance);
    const setLoading = useWalletStore((state) => state.setLoading);
    const setError = useWalletStore((state) => state.setError);
    const fetchWallet = useWalletStore((state) => state.fetchWallet);
    const requestWithdrawal = useWalletStore((state) => state.requestWithdrawal);

    return {
        // State
        wallet,
        isLoading,
        error,

        // Computed
        balance: wallet.balance,
        totalEarnings: wallet.totalEarnings,
        pendingAmount: wallet.pendingAmount,
        transactions: wallet.transactions,
        recentTransactions: wallet.transactions.slice(0, 10),
        canWithdraw: wallet.balance > 0,

        // Actions
        setWallet,
        addTransaction,
        updateBalance,
        setLoading,
        setError,
        fetchWallet,
        requestWithdrawal,
    };
};
