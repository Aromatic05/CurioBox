import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class DeleteUserDto {
    @ApiPropertyOptional({ description: 'ID of the user to delete (admin only)' })
    @IsNumber()
    @IsOptional()
    userId?: number;
}
