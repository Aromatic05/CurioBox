import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateBoxCountDto {
  @ApiProperty({ description: 'New total count for the curio box', example: 50 })
  @IsNumber()
  boxCount: number;
}
