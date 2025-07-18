import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ description: '原密码', example: 'oldpassword123' })
    @IsString()
    @IsNotEmpty()
    oldPassword!: string;

    @ApiProperty({ description: '新密码，至少6位', example: 'newpassword456' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword!: string;
}
