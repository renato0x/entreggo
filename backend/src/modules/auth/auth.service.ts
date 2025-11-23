import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DriversService } from '../../drivers/drivers.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private driversService: DriversService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.driversService.findOne(email);
        if (user && user.password) {
            const isMatch = await bcrypt.compare(pass, user.password);
            if (isMatch) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            token: this.jwtService.sign(payload),
            user,
        };
    }

    async register(driverData: any) {
        const existingUser = await this.driversService.findOne(driverData.email);
        if (existingUser) {
            throw new UnauthorizedException('Email already exists');
        }

        const newUser = await this.driversService.create(driverData);
        const { password, ...result } = newUser;

        return this.login(result);
    }

    async forgotPassword(email: string) {
        const user = await this.driversService.findOne(email);

        if (!user) {
            // For security, don't reveal if email exists or not
            return {
                message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
            };
        }

        // TODO: In production, generate reset token and send email
        console.log(`Password reset requested for: ${email}`);

        return {
            message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
        };
    }
}
