import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { OtpModule } from '../otp/otp.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        OtpModule,
        WhatsappModule,
        GatewayModule,
    ],
    controllers: [OrdersController, HistoryController],
    providers: [OrdersService, HistoryService],
    exports: [OrdersService],
})
export class OrdersModule { }
