import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BanUserDto {
    @ApiProperty({ description: 'ID of the user to ban' })
    @IsNumber()
    userId: number;
}
