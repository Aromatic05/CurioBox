import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SetAvatarDto {
    @ApiProperty({ description: "URL of the user's avatar", example: '/static/avatar123.jpg' })
    @IsString()
    @IsNotEmpty()
    avatar: string;
}
