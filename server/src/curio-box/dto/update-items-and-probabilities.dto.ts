import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemProbabilityDto {
    @ApiProperty({ description: 'ID of the item', example: 101 })
    @IsNumber()
    itemId: number;

    @ApiProperty({ description: 'Probability of drawing this item', example: 0.25 })
    @IsNumber()
    probability: number;
}

export class UpdateItemsAndProbabilitiesDto {
    @ApiPropertyOptional({ description: 'Array of item IDs', example: [101, 102, 103] })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    itemIds?: number[];

    @ApiPropertyOptional({ type: [ItemProbabilityDto], description: 'Array of item probabilities', example: [ { itemId: 101, probability: 0.25 }, { itemId: 102, probability: 0.75 } ] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemProbabilityDto)
    @IsOptional()
    itemProbabilities?: ItemProbabilityDto[];
}
