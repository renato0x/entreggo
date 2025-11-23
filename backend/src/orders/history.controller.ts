import { Controller, Get, Query, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { HistoryService } from './history.service';
import { GetHistoryDto } from './dto/history.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Request } from 'express';

@Controller('drivers/orders')
@UseGuards(JwtAuthGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    /**
     * GET /drivers/orders/history
     * Get delivery history with filters and pagination
     */
    @Get('history')
    async getHistory(
        @Req() req: Request,
        @Query() filters: GetHistoryDto
    ) {
        try {
            const driverId = (req.user as any).id;
            if (!driverId) {
                throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
            }

            const result = await this.historyService.getDeliveryHistory(driverId, filters);
            return {
                success: true,
                data: result.items,
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
     * GET /drivers/orders/stats
     * Get delivery statistics
     */
    @Get('stats')
    async getStats(@Req() req: Request) {
        try {
            const driverId = (req.user as any).id;
            if (!driverId) {
                throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
            }

            const stats = await this.historyService.getDeliveryStats(driverId);
            return {
                success: true,
                data: stats,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
