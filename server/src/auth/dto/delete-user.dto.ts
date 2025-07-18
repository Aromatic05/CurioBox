import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class DeleteUserDto {
    @ApiPropertyOptional({ description: 'ID of the user to delete (admin only, normal users can omit)', example: 2 })
    @IsOptional()
    @IsNumber()
    userId?: number; // 仅管理员可指定userId，否则为自己
}
