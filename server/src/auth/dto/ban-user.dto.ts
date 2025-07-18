import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class BanUserDto {
    @ApiProperty({ description: 'ID of the user to ban', example: 2 })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
