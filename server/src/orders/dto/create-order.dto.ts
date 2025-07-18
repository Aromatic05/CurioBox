import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ description: 'ID of the curio box to order', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    curioBoxId: number;
}
