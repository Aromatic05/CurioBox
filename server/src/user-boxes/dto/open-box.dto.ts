import { IsNumber, IsOptional, IsArray, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenBoxDto {
    @ApiPropertyOptional({ description: 'User box ID for single open', example: 123 })
    @IsNumber()
    @IsOptional()
    @ValidateIf((o: OpenBoxDto) => !o.userBoxIds)
    userBoxId?: number; // 单个开启

    @ApiPropertyOptional({ description: 'User box IDs for batch open', example: [123, 124, 125], type: [Number] })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    @ValidateIf((o: OpenBoxDto) => !o.userBoxId)
    userBoxIds?: number[]; // 批量开启
}
