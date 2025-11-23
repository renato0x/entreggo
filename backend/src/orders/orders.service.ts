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
}
