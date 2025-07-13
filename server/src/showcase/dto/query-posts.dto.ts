import { IsEnum, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortBy {
    LATEST = 'latest',
    HOT = 'hot',
    COMPREHENSIVE = 'comprehensive'
}

export enum TimeRange {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    ALL = 'all'
}

export enum OrderBy {
    DESC = 'DESC',
    ASC = 'ASC'
}

export class QueryPostsDto {
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.LATEST;

    @IsOptional()
    @IsEnum(OrderBy)
    order?: OrderBy = OrderBy.DESC;

    @IsOptional()
    @IsEnum(TimeRange)
    timeRange?: TimeRange = TimeRange.ALL;

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => typeof value === 'string' ? value.split(',').map(Number) : value)
    tagIds?: number[];

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    pageSize?: number = 20;

    @IsOptional()
    @IsNumber()
    userId?: number;
}