import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTPService } from './otp.service';
import { OrderOTP } from './entities/order-otp.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OrderOTP])],
    providers: [OTPService],
    exports: [OTPService],
})
export class OtpModule { }
