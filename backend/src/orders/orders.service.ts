import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Order } from './entities/order.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { OTPService } from '../otp/otp.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { OrderAcceptedDto } from './dto/order-accepted.dto';
import { ProblemType } from './dto/delivery-problem.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly otpService: OTPService,
        private readonly whatsAppService: WhatsAppService,
    ) { }

    async acceptOrder(orderId: string, driverId: string): Promise<Order> {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const order = await transactionalEntityManager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Pedido não encontrado');
            }

            if (order.status !== 'PENDING') {
                throw new ConflictException('Este pedido já foi aceito por outro entregador');
            }

            const driver = await transactionalEntityManager.findOne(Driver, { where: { id: driverId } });
            if (!driver) {
                throw new NotFoundException('Motorista não encontrado');
            }

            if (driver.status !== 'ONLINE') {
                throw new ConflictException('Você precisa estar online para aceitar pedidos');
            }

            order.driverId = driverId;
            order.status = 'ACCEPTED';
            order.acceptedAt = new Date();

            await transactionalEntityManager.save(Order, order);

            driver.status = 'BUSY';
            await transactionalEntityManager.save(Driver, driver);

            return order;
        });
    }

    async startDelivery(orderId: string, driverId: string) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const order = await transactionalEntityManager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Pedido não encontrado');
            }

            if (order.driverId !== driverId) {
                throw new ForbiddenException('Este pedido pertence a outro entregador');
            }

            if (order.status !== 'ACCEPTED') {
                throw new ConflictException('Pedido não está pronto para iniciar entrega');
            }

            order.status = 'IN_TRANSIT';
            await transactionalEntityManager.save(Order, order);

            // Generate OTP and send to customer
            let otpCode = null;
            let whatsappSent = false;

            if (order.customerPhone) {
                try {
                    const driver = await transactionalEntityManager.findOne(Driver, { where: { id: driverId } });
                    const driverName = driver ? driver.name : 'Entregador';
                    const storeName = 'Loja Parceira'; // In a real app, fetch from establishment

                    const otp = await this.otpService.generateOTP(order.id);
                    otpCode = otp.code;
                    await this.whatsAppService.sendOTPMessage(order.customerPhone, otp.code, storeName, driverName);
                    whatsappSent = true;
                } catch (error) {
                    console.error('Failed to send OTP:', error);
                }
            }

            return {
                order,
                otpCode,
                whatsappSent
            };
        });
    }

    async arrivedAtDestination(orderId: string, driverId: string) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const order = await transactionalEntityManager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Pedido não encontrado');
            }

            if (order.driverId !== driverId) {
                throw new ForbiddenException('Este pedido pertence a outro entregador');
            }

            if (order.status !== 'IN_TRANSIT') {
                throw new ConflictException('Pedido não está em trânsito');
            }

            order.status = 'ARRIVED_AT_DELIVERY';
            await transactionalEntityManager.save(Order, order);

            return order;
        });
    }

    async validateOTP(orderId: string, code: string) {
        return await this.otpService.validateOTP(orderId, code);
    }

    async completeDelivery(orderId: string, driverId: string) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const order = await transactionalEntityManager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Pedido não encontrado');
            }

            if (order.driverId !== driverId) {
                throw new ForbiddenException('Este pedido pertence a outro entregador');
            }

            if (order.status !== 'IN_TRANSIT' && order.status !== 'ARRIVED_AT_DELIVERY') {
                throw new ConflictException('Pedido não está em andamento');
            }

            order.status = 'COMPLETED';
            order.completedAt = new Date();

            // Calculate earnings (simplified)
            const platformFee = Number(order.price) * 0.15;
            const driverEarnings = Number(order.price) - platformFee;

            // Update driver stats
            const driver = await transactionalEntityManager.findOne(Driver, { where: { id: driverId } });
            if (driver) {
                driver.status = 'ONLINE';
                driver.totalDeliveries += 1;
                driver.totalEarnings = Number(driver.totalEarnings) + driverEarnings;

                // Add score
                const scoreGained = 1;
                driver.score += scoreGained;

                await transactionalEntityManager.save(Driver, driver);
            }

            await transactionalEntityManager.save(Order, order);

            return {
                order,
                earnings: driverEarnings,
                scoreGained: 1,
                receipt: {
                    id: order.id,
                    amount: order.price,
                    date: new Date(),
                }
            };
        });
    }

    async reportProblem(orderId: string, driverId: string, problemType: ProblemType, description: string, attemptedContact: boolean) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const order = await transactionalEntityManager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Pedido não encontrado');
            }

            if (order.driverId !== driverId) {
                throw new ForbiddenException('Este pedido pertence a outro entregador');
            }

            order.status = 'PROBLEM';
            await transactionalEntityManager.save(Order, order);

            return {
                success: true,
                message: 'Problema reportado com sucesso',
                order
            };
        });
    }

    async discardOrder(orderId: string, driverId: string, notes?: string) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const order = await transactionalEntityManager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Pedido não encontrado');
            }

            if (order.status !== 'PROBLEM') {
                throw new ConflictException('Apenas pedidos com problema podem ser descartados');
            }

            order.status = 'DISCARDED';
            await transactionalEntityManager.save(Order, order);

            const driver = await transactionalEntityManager.findOne(Driver, { where: { id: driverId } });
            if (driver) {
                driver.status = 'ONLINE';
                await transactionalEntityManager.save(Driver, driver);
            }

            return {
                success: true,
                message: 'Pedido descartado com sucesso',
                order
            };
        });
    }

    async createReturnTrip(orderId: string, driverId: string, notes?: string) {
        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const order = await transactionalEntityManager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Pedido não encontrado');
            }

            if (order.status !== 'PROBLEM') {
                throw new ConflictException('Apenas pedidos com problema podem gerar devolução');
            }

            const returnOrder = new Order();
            returnOrder.establishmentId = order.establishmentId;
            returnOrder.driverId = driverId;
            returnOrder.pickupLocation = order.deliveryLocation;
            returnOrder.deliveryLocation = order.pickupLocation;
            returnOrder.price = order.price;
            returnOrder.status = 'ACCEPTED';
            returnOrder.acceptedAt = new Date();

            await transactionalEntityManager.save(Order, returnOrder);

            order.status = 'RETURNED';
            await transactionalEntityManager.save(Order, order);

            return {
                success: true,
                message: 'Viagem de devolução criada com sucesso',
                originalOrder: order,
                returnOrder
            };
        });
    }

    async getOrderStatus(orderId: string) {
        const order = await this.entityManager.findOne(Order, { where: { id: orderId } });
        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }
        return { status: order.status };
    }

    async getAvailableOrders(params: {
        latitude: number;
        longitude: number;
        radius: number;
        driverId: string;
        minPrice?: number;
        maxPrice?: number;
        orderBy?: 'distance' | 'price' | 'createdAt';
    }) {
        const { latitude, longitude, radius, driverId, minPrice, maxPrice, orderBy } = params;

        // 1. Get driver's approved categories
        const driverCategories = await this.entityManager.query(
            `SELECT category_id FROM driver_categories WHERE driver_id = $1 AND status = 'approved'`,
            [driverId]
        );
        const approvedCategoryIds = driverCategories.map((dc: any) => dc.category_id);

        // 2. Build query
        const query = this.entityManager
            .createQueryBuilder(Order, 'order')
            .leftJoinAndSelect('order.category', 'category')
            .where('order.status = :status', { status: 'PENDING' });

        // 3. Filter by category (if driver has categories, only show those. If order has no category, show to everyone?)
        // Logic:
        // - If order has NO category, everyone sees it.
        // - If order HAS category, driver must be approved in it.
        if (approvedCategoryIds.length > 0) {
            query.andWhere(
                '(order.categoryId IS NULL OR order.categoryId IN (:...approvedCategoryIds))',
                { approvedCategoryIds }
            );
        } else {
            // Driver has NO approved categories. Only show orders with NO category.
            query.andWhere('order.categoryId IS NULL');
        }

        // 4. Filter by price
        if (minPrice) {
            query.andWhere('order.price >= :minPrice', { minPrice });
        }
        if (maxPrice) {
            query.andWhere('order.price <= :maxPrice', { maxPrice });
        }

        // 5. Filter by location (Radius) - simplified using Haversine approximation or PostGIS if available
        // Assuming pickupLocation is stored as JSONB { latitude, longitude }
        // We'll fetch and filter in memory for simplicity if dataset is small, or use raw query for distance.
        // Using raw SQL for distance filter is better for performance.
        // Note: This assumes pickupLocation is a JSONB column.

        // For now, let's return all pending orders matching criteria and filter distance in memory 
        // (Not ideal for production with millions of orders, but fine for MVP)
        const orders = await query.getMany();

        const filteredOrders = orders.filter(order => {
            if (!order.pickupLocation) return false;
            const dist = this.calculateDistance(
                latitude,
                longitude,
                order.pickupLocation.latitude,
                order.pickupLocation.longitude
            );
            return dist <= radius;
        });

        // 6. Sort
        return filteredOrders.sort((a, b) => {
            if (orderBy === 'price') {
                return b.price - a.price; // Higher price first
            } else if (orderBy === 'createdAt') {
                return b.createdAt.getTime() - a.createdAt.getTime(); // Newest first
            } else {
                // Distance
                const distA = this.calculateDistance(latitude, longitude, a.pickupLocation.latitude, a.pickupLocation.longitude);
                const distB = this.calculateDistance(latitude, longitude, b.pickupLocation.latitude, b.pickupLocation.longitude);
                return distA - distB; // Closest first
            }
        });
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
