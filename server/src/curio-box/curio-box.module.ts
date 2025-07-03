import { Module } from '@nestjs/common';
import { CurioBoxService } from './curio-box.service';
import { CurioBoxController } from './curio-box.controller';

@Module({
  controllers: [CurioBoxController],
  providers: [CurioBoxService],
})
export class CurioBoxModule {}
