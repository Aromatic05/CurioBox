import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
    @ApiProperty({ description: 'New content of the comment', example: 'This is the updated comment content.' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
