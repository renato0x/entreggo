import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { DriversModule } from './drivers/drivers.module';
import { WalletModule } from './wallet/wallet.module';
import { OtpModule } from './otp/otp.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DriverCategoriesModule } from './modules/driver-categories/driver-categories.module';
import databaseConfig from './config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => configService.get('database'),
            inject: [ConfigService],
        }),
        OrdersModule,
        DriversModule,
        WalletModule,
        OtpModule,
        WhatsappModule,
        GatewayModule,
        GatewayModule,
        AuthModule,
        CategoriesModule,
        DriverCategoriesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
