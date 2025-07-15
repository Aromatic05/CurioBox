import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {
    @ApiPropertyOptional({ description: 'New name of the tag' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ description: 'New description of the tag' })
    @IsString()
    @IsOptional()
    description?: string;
}
