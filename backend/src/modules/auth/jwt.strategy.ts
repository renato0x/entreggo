import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DriversService } from '../../drivers/drivers.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private driversService: DriversService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'secretKey', // TODO: Move to env
        });
    }

    async validate(payload: any) {
        return this.driversService.findById(payload.sub);
    }
}
