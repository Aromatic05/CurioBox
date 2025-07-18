import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SetNicknameDto {
    @ApiProperty({ description: 'User nickname', example: 'Tommy' })
    @IsString()
    @IsNotEmpty()
    nickname: string;
}
