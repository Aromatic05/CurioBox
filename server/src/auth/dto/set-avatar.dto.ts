import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class SetAvatarDto {
    @ApiProperty({ description: 'URL of the user\'s avatar' })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    avatar: string;
}
