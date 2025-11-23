import { Controller, Get, Post, Body, Query, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetTransactionsDto, WithdrawRequestDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Request } from 'express';

@Controller('drivers/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    /**
     * GET /drivers/wallet
     * Get wallet summary with balance and earnings
     */
    @Get()
    async getWallet(@Req() req: Request) {
        try {
            const driverId = (req.user as any).id;
            if (!driverId) {
                throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
            }

            const summary = await this.walletService.getWalletSummary(driverId);
            return {
                success: true,
                data: summary,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /drivers/wallet/transactions
     * Get transaction history with filters and pagination
     */
    @Get('transactions')
    async getTransactions(
        @Req() req: Request,
        @Query() filters: GetTransactionsDto
    ) {
        try {
            const driverId = (req.user as any).id;
            if (!driverId) {
                throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
            }

            const result = await this.walletService.getTransactions(driverId, filters);
            return {
                success: true,
                data: result.transactions,
                pagination: {
                    total: result.total,
                    limit: result.limit,
                    offset: result.offset,
                    hasMore: result.hasMore,
                },
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /drivers/wallet/withdraw
     * Request withdrawal
     */
    @Post('withdraw')
    async requestWithdrawal(
        @Req() req: Request,
        @Body() dto: WithdrawRequestDto
    ) {
        try {
            const driverId = (req.user as any).id;
            if (!driverId) {
                throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
            }

            const withdrawal = await this.walletService.requestWithdrawal(driverId, dto);
            return {
                success: true,
                message: 'Withdrawal requested successfully',
                data: withdrawal,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /drivers/wallet/withdrawals
     * Get withdrawal history
     */
    @Get('withdrawals')
    async getWithdrawals(@Req() req: Request) {
        try {
            const driverId = (req.user as any).id;
            if (!driverId) {
                throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
            }

            const withdrawals = await this.walletService.getWithdrawals(driverId);
            return {
                success: true,
                data: withdrawals,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
