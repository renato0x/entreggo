import { create } from 'zustand';
import { Wallet, WalletState, Transaction } from '../types/store';

interface WalletActions {
    setWallet: (wallet: Wallet) => void;
    addTransaction: (transaction: Transaction) => void;
    updateBalance: (amount: number) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchWallet: () => Promise<void>;
    requestWithdrawal: (amount: number) => Promise<void>;
}

type WalletStore = WalletState & WalletActions;

const initialWallet: Wallet = {
    balance: 0,
    totalEarnings: 0,
    pendingAmount: 0,
    transactions: [],
};

export const useWalletStore = create<WalletStore>((set, get) => ({
    // Initial State
    wallet: initialWallet,
    isLoading: false,
    error: null,

    // Actions
    setWallet: (wallet) => {
        set({ wallet, error: null });
    },

    addTransaction: (transaction) => {
        set((state) => ({
            wallet: {
                ...state.wallet,
                transactions: [transaction, ...state.wallet.transactions],
            },
        }));
    },

    updateBalance: (amount) => {
        set((state) => ({
            wallet: {
                ...state.wallet,
                balance: state.wallet.balance + amount,
                totalEarnings: amount > 0 ? state.wallet.totalEarnings + amount : state.wallet.totalEarnings,
            },
        }));
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },

    setError: (error) => {
        set({ error });
    },

    // Async Actions
    fetchWallet: async () => {
        set({ isLoading: true, error: null });
        try {
            // TODO: Implement API call
            // const wallet = await walletService.fetch();
            // set({ wallet });

            // Mock data for now
            await new Promise((resolve) => setTimeout(resolve, 1000));
            set({ wallet: initialWallet });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    requestWithdrawal: async (amount) => {
        const { wallet } = get();

        if (amount > wallet.balance) {
            set({ error: 'Saldo insuficiente' });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            // TODO: Implement API call
            // await walletService.withdraw(amount);

            const transaction: Transaction = {
                id: `txn_${Date.now()}`,
                type: 'withdrawal',
                amount: -amount,
                description: 'Saque solicitado',
                status: 'pending',
                createdAt: new Date().toISOString(),
            };

            get().addTransaction(transaction);
            get().updateBalance(-amount);
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },
}));
