import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurioBox } from './entities/curio-box.entity';
import { CurioBoxService } from './curio-box.service';
import { CurioBoxController } from './curio-box.controller';
import { BlocklistedToken } from '../auth/entities/blocklisted-token.entity'; // 导入 BlocklistedToken 实体

@Module({
  imports: [TypeOrmModule.forFeature([CurioBox, BlocklistedToken])],
  controllers: [CurioBoxController],
  providers: [CurioBoxService],
})
export class CurioBoxModule {}