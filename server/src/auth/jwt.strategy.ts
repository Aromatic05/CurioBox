import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { blocklistedTokens } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'yourSecretKey',
    });
  }

  async validate(payload: any) {
    const token = this.extractTokenFromHeader();
    if (token && blocklistedTokens.has(token)) {
      throw new UnauthorizedException('Token is blocklisted');
    }
    return { sub: payload.sub, username: payload.username, role: payload.role };
  }

  private extractTokenFromHeader(): string | undefined {
    // This is a simplified way to get the token. 
    // In a real app, you would get it from the request object.
    return ''; 
  }
}