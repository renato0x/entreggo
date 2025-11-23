import { Controller, Param, Body, Post, Get, Req, UseGuards, HttpException, HttpStatus, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Request } from 'express';
import { OrderAcceptedDto } from './dto/order-accepted.dto';
import { OrdersGateway } from '../gateway/orders.gateway';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

/**
 * Controller handling order acceptance.
 * Endpoint: POST /orders/:id/accept
 */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly ordersGateway: OrdersGateway,
    ) { }

    @Get('available')
    async getAvailableOrders(
        @Query('latitude') latitude: number,
        @Query('longitude') longitude: number,
        @Query('radius') radius: number,
        @Query('minPrice') minPrice: number,
        @Query('maxPrice') maxPrice: number,
        @Query('orderBy') orderBy: 'distance' | 'price' | 'createdAt',
        @Req() req: Request,
    ) {
        const driverId = (req.user as any).id;
        return this.ordersService.getAvailableOrders({
            latitude: Number(latitude),
            longitude: Number(longitude),
            radius: Number(radius) || 10,
            driverId,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            orderBy,
        });
    }

    @Post(':id/accept')
    async acceptOrder(
        @Param('id') orderId: string,
        @Body() body: OrderAcceptedDto,
        @Req() req: Request,
    ) {
        // Assuming authentication middleware populates req.user with driver info
        const driverId = body.driverId || (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const order = await this.ordersService.acceptOrder(orderId, driverId);
            // Emit WebSocket event to other drivers
            this.ordersGateway.emitOrderAccepted(orderId, driverId);
            return { success: true, order };
        } catch (error) {
            // Propagate known errors
            if (error instanceof HttpException) {
                throw error;
            }
            // Unexpected error
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Start delivery - Generate OTP and send to customer
     * Endpoint: POST /orders/:id/start-delivery
     */
    @Post(':id/start-delivery')
    async startDelivery(
        @Param('id') orderId: string,
        @Req() req: Request,
    ) {
        const driverId = (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const result = await this.ordersService.startDelivery(orderId, driverId);

            return {
                success: true,
                order: result.order,
                otpCode: result.otpCode,
                whatsappSent: result.whatsappSent,
                expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mark as arrived at destination
     * Endpoint: POST /orders/:id/arrived-at-destination
     */
    @Post(':id/arrived-at-destination')
    async arrivedAtDestination(
        @Param('id') orderId: string,
        @Req() req: Request,
    ) {
        const driverId = (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const order = await this.ordersService.arrivedAtDestination(orderId, driverId);
            return { success: true, order };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Validate OTP code
     * Endpoint: POST /orders/:id/validate-otp
     */
    @Post(':id/validate-otp')
    async validateOTP(
        @Param('id') orderId: string,
        @Body() body: { code: string },
        @Req() req: Request,
    ) {
        const driverId = (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const result = await this.ordersService.validateOTP(orderId, body.code);
            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Complete delivery
     * Endpoint: POST /orders/:id/complete
     */
    @Post(':id/complete')
    async completeDelivery(
        @Param('id') orderId: string,
        @Req() req: Request,
    ) {
        const driverId = (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const result = await this.ordersService.completeDelivery(orderId, driverId);
            return {
                success: true,
                order: result.order,
                earnings: result.earnings,
                scoreGained: result.scoreGained,
                receipt: result.receipt,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Report delivery problem
     * Endpoint: POST /orders/:id/problem
     */
    @Post(':id/problem')
    async reportProblem(
        @Param('id') orderId: string,
        @Body() body: any,
        @Req() req: Request,
    ) {
        const driverId = (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const order = await this.ordersService.reportProblem(
                orderId,
                driverId,
                body.problemType,
                body.description,
                body.attemptedContact
            );
            return { success: true, order };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Discard order (establishment decision)
     * Endpoint: POST /orders/:id/problem/discard
     */
    @Post(':id/problem/discard')
    async discardOrder(
        @Param('id') orderId: string,
        @Body() body: { notes?: string },
        @Req() req: Request,
    ) {
        const driverId = (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const result = await this.ordersService.discardOrder(orderId, driverId, body.notes);
            return {
                success: true,
                order: result.order,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create return trip (establishment decision)
     * Endpoint: POST /orders/:id/problem/return
     */
    @Post(':id/problem/return')
    async createReturnTrip(
        @Param('id') orderId: string,
        @Body() body: { notes?: string },
        @Req() req: Request,
    ) {
        const driverId = (req.user && (req.user as any).id);
        if (!driverId) {
            throw new HttpException('Driver not authorized', HttpStatus.FORBIDDEN);
        }

        try {
            const result = await this.ordersService.createReturnTrip(orderId, driverId, body.notes);
            return {
                success: true,
                originalOrder: result.originalOrder,
                returnOrder: result.returnOrder,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get order status (for polling)
     * Endpoint: GET /orders/:id/status
     */
    @Get(':id/status')
    async getOrderStatus(
        @Param('id') orderId: string,
        @Req() req: Request,
    ) {
        try {
            const order = await this.ordersService.getOrderStatus(orderId);
            return {
                status: order.status,
                problemResolution: (order as any).problemResolution,
                returnOrderId: (order as any).returnOrderId,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

