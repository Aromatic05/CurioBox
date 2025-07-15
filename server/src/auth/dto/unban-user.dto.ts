import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UnbanUserDto {
    @ApiProperty({ description: 'ID of the user to unban' })
    @IsNumber()
    userId: number;
}
