import {
    IsEnum,
    IsOptional,
    IsArray,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
    LATEST = 'latest',
    HOT = 'hot',
    COMPREHENSIVE = 'comprehensive',
}

export enum TimeRange {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    ALL = 'all',
}

export enum OrderBy {
    DESC = 'DESC',
    ASC = 'ASC',
}

export class QueryPostsDto {
    @ApiPropertyOptional({ enum: SortBy, description: 'Sort type', example: SortBy.LATEST })
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy;

    @ApiPropertyOptional({ enum: OrderBy, description: 'Order direction', example: OrderBy.DESC })
    @IsOptional()
    @IsEnum(OrderBy)
    order?: OrderBy;

    @ApiPropertyOptional({ enum: TimeRange, description: 'Time range for filtering', example: TimeRange.ALL })
    @IsOptional()
    @IsEnum(TimeRange)
    timeRange?: TimeRange;

    @ApiPropertyOptional({ description: 'Tag IDs to filter', example: [1, 2, 3], type: [Number] })
    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(Number);
        }
        if (Array.isArray(value)) {
            return value.map(Number);
        }
        if (typeof value === 'number') {
            return [value];
        }
        return [];
    })
    tagIds?: number[];

    @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Page size', example: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    pageSize?: number = 20;

    @ApiPropertyOptional({ description: 'User ID to filter', example: 123 })
    @IsOptional()
    @IsNumber()
    userId?: number;

    @ApiPropertyOptional({ description: 'Curio box ID to filter', example: 5 })
    @IsOptional()
    @IsNumber()
    curioBoxId?: number;
}
