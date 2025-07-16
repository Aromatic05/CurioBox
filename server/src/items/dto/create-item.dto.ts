import {
    IsString,
    IsNotEmpty,
    IsNumber,
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
