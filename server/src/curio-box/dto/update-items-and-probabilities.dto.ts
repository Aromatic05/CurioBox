import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemProbabilityDto {
    @ApiProperty({ description: 'ID of the item' })
    @IsNumber()
    itemId: number;

    @ApiProperty({ description: 'Probability of drawing this item' })
    @IsNumber()
    probability: number;
}

export class UpdateItemsAndProbabilitiesDto {
    @ApiPropertyOptional({ description: 'Array of item IDs' })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    itemIds?: number[];

    @ApiPropertyOptional({ type: [ItemProbabilityDto], description: 'Array of item probabilities' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemProbabilityDto)
    @IsOptional()
    itemProbabilities?: ItemProbabilityDto[];
}
