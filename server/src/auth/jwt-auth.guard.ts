import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlocklistedToken } from './entities/blocklisted-token.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @InjectRepository(BlocklistedToken)
    private blocklistedTokenRepository: Repository<BlocklistedToken>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 先执行原有的 JWT 校验
    const can = await super.canActivate(context);
    if (!can) return false;
    // blocklist 校验
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const exists = await this.blocklistedTokenRepository.findOne({ where: { token } });
        if (exists) {
          throw new UnauthorizedException('Token is blocklisted');
        }
      }
    }
    return true;
  }
}