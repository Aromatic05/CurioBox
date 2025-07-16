import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'yourSecretKey',
        });
    }

    async validate(payload: { sub: number; username: string; role: string }) {
        const user = await this.usersService.findActiveById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        return {
            sub: payload.sub,
            username: payload.username,
            role: payload.role,
        };
    }
}
