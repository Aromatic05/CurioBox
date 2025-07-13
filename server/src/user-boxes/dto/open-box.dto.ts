import { IsNumber, IsOptional, IsArray, ValidateIf } from 'class-validator';

export class OpenBoxDto {
    @IsNumber()
    @IsOptional()
    @ValidateIf((o) => !o.userBoxIds)
    userBoxId?: number; // 单个开启

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    @ValidateIf((o) => !o.userBoxId)
    userBoxIds?: number[]; // 批量开启
}
