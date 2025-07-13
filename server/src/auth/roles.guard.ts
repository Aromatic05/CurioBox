import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlocklistedToken } from './entities/blocklisted-token.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(BlocklistedToken)
        private blocklistedTokenRepository: Repository<BlocklistedToken>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader =
            req.headers['authorization'] || req.headers['Authorization'];
        if (authHeader && typeof authHeader === 'string') {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                try {
                    const exists =
                        await this.blocklistedTokenRepository.findOne({
                            where: { token },
                        });
                    if (exists) {
                        throw new UnauthorizedException('Token is blocklisted');
                    }
                } catch (err) {
                    // 数据库异常时不抛 500，直接拒绝访问更安全
                    throw new UnauthorizedException('Token check failed');
                }
            }
        }
        // 没有 token 或 blocklist 校验通过，继续角色校验
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            'roles',
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) {
            return true;
        }
        const { user } = req;
        return requiredRoles.includes(user.role);
    }
}
