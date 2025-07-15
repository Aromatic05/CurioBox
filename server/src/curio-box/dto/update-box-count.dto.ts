import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateBoxCountDto {
    @ApiProperty({ description: 'New count for the curio box' })
    @IsNumber()
    boxCount: number;
}
