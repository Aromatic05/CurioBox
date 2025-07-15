import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class PurchaseCurioBoxDto {
    @ApiProperty({ description: 'ID of the curio box to purchase' })
    @IsNumber()
    curioBoxId: number;

    @ApiPropertyOptional({ description: 'Quantity of curio boxes to purchase', default: 1 })
    @IsNumber()
    @IsOptional()
    quantity?: number;
}
