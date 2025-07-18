import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ description: 'Content of the comment', example: 'Great post!' })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({ description: 'ID of the post being commented on', example: 123 })
    @IsNotEmpty()
    @IsNumber()
    postId: number;

    @ApiPropertyOptional({ description: 'Parent comment ID (for replies)', example: 456 })
    @IsOptional()
    @IsNumber()
    parentId?: number;
}
