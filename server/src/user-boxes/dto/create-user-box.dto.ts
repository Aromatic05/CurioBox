import { IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserBoxDto {
    @ApiProperty({ description: 'ID of the curio box to purchase', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    curioBoxId: number;

    @ApiPropertyOptional({ description: 'Quantity to purchase (default: 1)', example: 1, minimum: 1 })
    @IsNumber()
    @IsOptional()
    @Min(1)
    quantity?: number = 1;
}
