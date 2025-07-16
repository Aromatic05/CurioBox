// /home/aromatic/Applications/CurioBox/server/src/curio-box/dto/create-curio-box.dto.ts

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

export class ItemProbabilityDto {
    @IsNumberField()
    @IsPositive()
    itemId: number;

    @IsNumberField()
    probability: number;
}

// FIX: 创建一个辅助函数来安全地解析未知值到对象
// 这个函数保证了返回类型是 `Record<string, unknown> | null`，而不是 `any`。
function safeParseToObject(value: unknown): Record<string, unknown> | null {
    // 如果已经是对象，直接返回
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

export class CreateCurioBoxDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsPositive()
    @IsDefined()
    boxCount: number;

    @IsOptional()
    // @IsUrl()
    coverImage?: string;

    @IsString()
    @IsNotEmpty()
    category: string;

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

    @IsOptional()
    @Transform(({ value }) => {
        // Case 1: 值已经是一个数组 (e.g., from multipart/form-data)
        if (Array.isArray(value)) {
            // FIX: 使用辅助函数安全地映射每个元素，并过滤掉无效项。
            // .map() 返回 (Record<string, unknown> | null)[]
            // .filter(Boolean) 移除所有 null，最终返回类型为 Record<string, unknown>[]，这是类型安全的。
            return value.map(safeParseToObject).filter(Boolean);
        }

        // Case 2: 值是一个字符串 (e.g., from x-www-form-urlencoded)
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value) as unknown;

                // 如果解析结果是一个数组
                if (Array.isArray(parsed)) {
                    // FIX: 同样，安全地处理这个数组，确保返回类型安全。
                    return parsed.map(safeParseToObject).filter(Boolean);
                }

                // 如果解析结果是一个单独的对象
                const singleObject = safeParseToObject(parsed);
                if (singleObject) {
                    return [singleObject];
                }
            } catch {
                // JSON 格式无效
                return [];
            }
        }

        // 所有其他情况
        return [];
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemProbabilityDto)
    itemProbabilities?: ItemProbabilityDto[];
}