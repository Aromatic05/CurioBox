import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SetNicknameDto {
    @ApiProperty({ description: 'User nickname' })
    @IsString()
    @IsNotEmpty()
    nickname: string;
}
