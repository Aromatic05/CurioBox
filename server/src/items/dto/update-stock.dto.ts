import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateStockDto {
    @ApiProperty({ description: 'New stock quantity for the item' })
    @IsNumber()
    stock: number;
}
