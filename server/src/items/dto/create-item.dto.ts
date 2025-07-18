import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsArray,
    IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
    @ApiProperty({ description: 'Name of the item', example: 'Teddy Bear' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'Image URL of the item', example: '/static/item1.jpg' })
    @IsOptional()
    // @IsUrl()
    image?: string;

    @ApiProperty({ description: 'Category of the item', example: 'toys' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ description: 'Stock of the item', example: 100 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    stock: number;

    @ApiProperty({ description: 'Rarity of the item', example: 'rare' })
    @IsString()
    @IsNotEmpty()
    rarity: string;

    @ApiPropertyOptional({ description: 'IDs of curio boxes this item belongs to', example: [1, 2, 3], type: [Number] })
    @IsOptional()
    @Transform(({ value }) => {
        const toNumber = (v: unknown): number | undefined => {
            if (typeof v === 'number' && !isNaN(v)) return v;
            if (typeof v === 'string') {
                const n = Number(v);
                return !isNaN(n) ? n : undefined;
            }
            return undefined;
        };
        if (Array.isArray(value)) return value.map(toNumber).filter((v): v is number => v !== undefined);
        if (typeof value === 'string' && value.startsWith('[')) {
            try {
                const arr: unknown = JSON.parse(value);
                if (Array.isArray(arr)) return arr.map(toNumber).filter((v): v is number => v !== undefined);
                return [];
            } catch {
                return [];
            }
        }
        if (typeof value === 'string') {
            const n = Number(value);
            return !isNaN(n) ? [n] : [];
        }
        if (typeof value === 'number') return [value];
        return [];
    })
    @IsArray()
    @IsNumber({}, { each: true })
    curioBoxIds?: number[];
}
