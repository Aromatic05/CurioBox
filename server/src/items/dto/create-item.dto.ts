import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsUrl,
    IsArray,
    IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    // @IsUrl()
    image?: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    stock: number;

    @IsString()
    @IsNotEmpty()
    rarity: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) return value.map(Number);
        if (typeof value === 'string' && value.startsWith('['))
            try {
                return JSON.parse(value).map(Number);
            } catch {
                return [];
            }
        if (typeof value === 'string') return [Number(value)];
        if (typeof value === 'number') return [value];
        return [];
    })
    @IsArray()
    @IsNumber({}, { each: true })
    curioBoxIds?: number[];
}
