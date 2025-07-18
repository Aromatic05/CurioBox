import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    IsNumber as IsNumberField,
    IsPositive,
    IsDefined,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Helper function must be declared before usage
function safeParseToObject(value: unknown): Record<string, unknown> | null {
    if (typeof value === 'object' && value !== null) {
        return value as Record<string, unknown>;
    }
    // 如果是字符串，尝试解析
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value) as unknown;
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed as Record<string, unknown>;
            }
        } catch {
            return null; // 解析失败
        }
    }
    return null; // 其他类型或解析失败
}

// Move ItemProbabilityDto to the top so it can be referenced below
export class ItemProbabilityDto {
    @ApiProperty({ description: 'ID of the item', example: 101 })
    @IsNumberField()
    @IsPositive()
    itemId: number;

    @ApiProperty({ description: 'Probability for this item (0~1)', example: 0.25 })
    @IsNumberField()
    probability: number;
}

export class CreateCurioBoxDto {
    @ApiProperty({ description: 'Name of the curio box', example: 'Lucky Box' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Description of the curio box', example: 'A box full of surprises.' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Price of the curio box', example: 99.99 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @ApiProperty({ description: 'Total number of boxes available', example: 100 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsPositive()
    @IsDefined()
    boxCount: number;

    @ApiPropertyOptional({ description: 'Cover image URL', example: '/static/cover.jpg' })
    @IsOptional()
    // @IsUrl()
    coverImage?: string;

    @ApiProperty({ description: 'Category of the curio box', example: 'toys' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiPropertyOptional({ description: 'IDs of items in the box', example: [1, 2, 3], type: [Number] })
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(Number).filter(v => !isNaN(v));
        }
        if (typeof value === 'string' && value.startsWith('[')) {
            try {
                const parsed = JSON.parse(value) as unknown;
                if (Array.isArray(parsed)) {
                    return parsed.map(Number).filter(v => !isNaN(v));
                }
                return [];
            } catch {
                return [];
            }
        }
        if (typeof value === 'string') {
            const num = Number(value);
            return isNaN(num) ? [] : [num];
        }
        if (typeof value === 'number') {
            return [value];
        }
        return [];
    })
    @IsArray()
    @IsNumberField({}, { each: true })
    itemIds?: number[];

    @ApiPropertyOptional({ description: 'Item probabilities (itemId & probability)', type: [ItemProbabilityDto], example: [ { itemId: 101, probability: 0.25 }, { itemId: 102, probability: 0.75 } ] })
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(safeParseToObject).filter(Boolean);
        }
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value) as unknown;
                if (Array.isArray(parsed)) {
                    return parsed.map(safeParseToObject).filter(Boolean);
                }
                const singleObject = safeParseToObject(parsed);
                if (singleObject) {
                    return [singleObject];
                }
            } catch {
                return [];
            }
        }
        return [];
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemProbabilityDto)
    itemProbabilities?: ItemProbabilityDto[];
}