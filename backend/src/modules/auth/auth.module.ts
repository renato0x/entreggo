import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DriversModule } from '../../drivers/drivers.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        DriversModule,
        PassportModule,
        JwtModule.register({
            secret: 'secretKey', // TODO: Move to env
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
