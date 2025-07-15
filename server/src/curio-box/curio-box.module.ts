import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurioBox } from './entities/curio-box.entity';
import { CurioBoxService } from './curio-box.service';
import { CurioBoxController } from './curio-box.controller';
import { BlocklistedToken } from '../auth/entities/blocklisted-token.entity';
import { Item } from '../items/entities/item.entity';
import { ShowcaseModule } from '../showcase/showcase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CurioBox, Item, BlocklistedToken]),
        ShowcaseModule,
        AuthModule,
    ],
    controllers: [CurioBoxController],
    providers: [CurioBoxService],
})
export class CurioBoxModule {}
