import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UnbanUserDto {
    @ApiProperty({ description: 'ID of the user to unban', example: 2 })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
