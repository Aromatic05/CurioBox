import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ description: '用户名，必填', example: 'testuser' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: '密码，必填，至少6位', example: 'password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiPropertyOptional({ description: '用户角色，可选，默认 user', example: 'user' })
    @IsString()
    @IsOptional()
    role?: string; // 用户角色，可选，默认 'user'
}
