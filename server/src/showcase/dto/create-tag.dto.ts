import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTagDto {
    @ApiProperty({ description: 'Name of the tag' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'Description of the tag' })
    @IsString()
    @IsOptional()
    description?: string;
}
