import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurioBox } from './entities/curio-box.entity';
import { CurioBoxService } from './curio-box.service';
import { CurioBoxController } from './curio-box.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CurioBox])],
  controllers: [CurioBoxController],
  providers: [CurioBoxService],
})
export class CurioBoxModule {}