import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username (required)', example: 'testuser' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password (required, at least 6 characters)', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({ description: 'User role (optional, default: user)', example: 'user' })
  @IsString()
  @IsOptional()
  role?: string; // 用户角色，可选，默认 'user'
}
