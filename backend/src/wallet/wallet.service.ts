import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction, TransactionType, WithdrawalStatus } from './entities/wallet-transaction.entity';
import { GetTransactionsDto, WithdrawRequestDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
    private readonly MIN_WITHDRAWAL_AMOUNT = 50; // R$ 50
    private readonly WITHDRAWAL_FEE = 0; // No fee for now

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    /**
     * Get or create wallet for driver
     */
    async getOrCreateWallet(driverId: string): Promise<Wallet> {
        let wallet = await this.entityManager.findOne(Wallet, {
            where: { driverId },
        });

        if (!wallet) {
            wallet = this.entityManager.create(Wallet, {
                driverId,
                balance: 0,
                totalEarnings: 0,
                totalWithdrawals: 0,
            });
            await this.entityManager.save(wallet);
        }

        return wallet;
    }

    /**
     * Get wallet summary with monthly and weekly earnings
     */
    async getWalletSummary(driverId: string) {
        const wallet = await this.getOrCreateWallet(driverId);

        // Calculate monthly earnings
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyTransactions = await this.entityManager.find(WalletTransaction, {
            where: {
                walletId: wallet.id,
                type: TransactionType.DELIVERY_COMPLETED,
                createdAt: MoreThanOrEqual(startOfMonth),
            },
        });

        const monthlyEarnings = monthlyTransactions.reduce(
            (sum, t) => sum + Number(t.amount),
            0
        );

        // Calculate weekly earnings
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyTransactions = await this.entityManager.find(WalletTransaction, {
            where: {
                walletId: wallet.id,
                type: TransactionType.DELIVERY_COMPLETED,
                createdAt: MoreThanOrEqual(startOfWeek),
            },
        });

        const weeklyEarnings = weeklyTransactions.reduce(
            (sum, t) => sum + Number(t.amount),
            0
        );

        return {
            balance: Number(wallet.balance),
            totalEarnings: Number(wallet.totalEarnings),
            totalWithdrawals: Number(wallet.totalWithdrawals),
            monthlyEarnings,
            weeklyEarnings,
            updatedAt: wallet.updatedAt,
        };
    }

    /**
     * Get wallet transactions with filters and pagination
     */
    async getTransactions(driverId: string, filters: GetTransactionsDto) {
        const wallet = await this.getOrCreateWallet(driverId);

        const queryBuilder = this.entityManager
            .createQueryBuilder(WalletTransaction, 'transaction')
            .where('transaction.walletId = :walletId', { walletId: wallet.id })
            .orderBy('transaction.createdAt', 'DESC');

        // Apply filters
        if (filters.type) {
            queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
        }

        if (filters.startDate && filters.endDate) {
            queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        } else if (filters.startDate) {
            queryBuilder.andWhere('transaction.createdAt >= :startDate', {
                startDate: filters.startDate,
            });
        } else if (filters.endDate) {
            queryBuilder.andWhere('transaction.createdAt <= :endDate', {
                endDate: filters.endDate,
            });
        }

        if (filters.minAmount !== undefined) {
            queryBuilder.andWhere('transaction.amount >= :minAmount', {
                minAmount: filters.minAmount,
            });
        }

        if (filters.maxAmount !== undefined) {
            queryBuilder.andWhere('transaction.amount <= :maxAmount', {
                maxAmount: filters.maxAmount,
            });
        }

        if (filters.search) {
            queryBuilder.andWhere('transaction.description ILIKE :search', {
                search: `%${filters.search}%`,
            });
        }

        // Pagination
        const limit = filters.limit || 20;
        const offset = filters.offset || 0;

        const [transactions, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return {
            transactions,
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };
    }

    /**
     * Request withdrawal
     */
    async requestWithdrawal(driverId: string, dto: WithdrawRequestDto) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const wallet = await transactionalEntityManager.findOne(Wallet, {
                where: { driverId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!wallet) {
                throw new NotFoundException('Wallet not found');
            }

            const balance = Number(wallet.balance);
            const amount = Number(dto.amount);

            // Validate amount
            if (amount < this.MIN_WITHDRAWAL_AMOUNT) {
                throw new BadRequestException(
                    `Minimum withdrawal amount is R$ ${this.MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`
                );
            }

            if (amount > balance) {
                throw new BadRequestException('Insufficient balance');
            }

            // Calculate final amount (with fee if applicable)
            const fee = amount * this.WITHDRAWAL_FEE;
            const finalAmount = amount - fee;

            // Update wallet balance
            wallet.balance = balance - amount;
            wallet.totalWithdrawals = Number(wallet.totalWithdrawals) + amount;
            await transactionalEntityManager.save(wallet);

            // Create withdrawal transaction
            const transaction = transactionalEntityManager.create(WalletTransaction, {
                walletId: wallet.id,
                type: TransactionType.WITHDRAWAL_REQUESTED,
                amount: -amount,
                description: `Saque solicitado - R$ ${amount.toFixed(2)}`,
                withdrawalStatus: WithdrawalStatus.PENDING,
                balanceBefore: balance,
                balanceAfter: balance - amount,
                metadata: {
                    bankAccount: dto.bankAccount,
                    notes: dto.notes,
                    fee,
                    finalAmount,
                },
            });

            const savedTransaction = await transactionalEntityManager.save(transaction);

            // TODO: Notify admin about withdrawal request

            return {
                id: savedTransaction.id,
                amount,
                fee,
                finalAmount,
                status: WithdrawalStatus.PENDING,
                requestedAt: savedTransaction.createdAt,
            };
        });
    }

    /**
     * Add credit to wallet (e.g., from completed delivery)
     */
    async addCredit(
        driverId: string,
        amount: number,
        type: TransactionType,
        description: string,
        orderId?: string
    ) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const wallet = await transactionalEntityManager.findOne(Wallet, {
                where: { driverId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!wallet) {
                throw new NotFoundException('Wallet not found');
            }

            const balanceBefore = Number(wallet.balance);
            const balanceAfter = balanceBefore + Number(amount);

            // Update wallet
            wallet.balance = balanceAfter;
            if (type === TransactionType.DELIVERY_COMPLETED) {
                wallet.totalEarnings = Number(wallet.totalEarnings) + Number(amount);
            }
            await transactionalEntityManager.save(wallet);

            // Create transaction
            const transaction = transactionalEntityManager.create(WalletTransaction, {
                walletId: wallet.id,
                type,
                amount: Number(amount),
                description,
                orderId,
                balanceBefore,
                balanceAfter,
            });

            await transactionalEntityManager.save(transaction);

            return wallet;
        });
    }

    /**
     * Deduct from wallet (e.g., for cancellation penalty)
     */
    async deductAmount(
        driverId: string,
        amount: number,
        type: TransactionType,
        description: string,
        orderId?: string
    ) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const wallet = await transactionalEntityManager.findOne(Wallet, {
                where: { driverId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!wallet) {
                throw new NotFoundException('Wallet not found');
            }

            const balanceBefore = Number(wallet.balance);
            const balanceAfter = balanceBefore - Number(amount);

            // Update wallet
            wallet.balance = balanceAfter;
            await transactionalEntityManager.save(wallet);

            // Create transaction
            const transaction = transactionalEntityManager.create(WalletTransaction, {
                walletId: wallet.id,
                type,
                amount: -Number(amount),
                description,
                orderId,
                balanceBefore,
                balanceAfter,
            });

            await transactionalEntityManager.save(transaction);

            return wallet;
        });
    }

    /**
     * Get withdrawal history
     */
    async getWithdrawals(driverId: string) {
        const wallet = await this.getOrCreateWallet(driverId);

        const withdrawals = await this.entityManager.find(WalletTransaction, {
            where: {
                walletId: wallet.id,
                type: TransactionType.WITHDRAWAL_REQUESTED,
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return withdrawals.map(w => ({
            id: w.id,
            amount: Math.abs(Number(w.amount)),
            status: w.withdrawalStatus,
            requestedAt: w.createdAt,
            bankAccount: w.metadata?.bankAccount,
            notes: w.metadata?.notes,
        }));
    }
}
