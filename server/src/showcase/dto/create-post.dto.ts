import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
    @ApiProperty({ description: 'Title of the post', example: 'My new box opening!' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Content of the post', example: 'I just opened a new curio box and got a rare item!' })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({ description: 'Image URLs for the post', example: ['/static/img1.jpg', '/static/img2.jpg'], type: [String] })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiPropertyOptional({ description: 'Tag IDs for the post', example: [1, 2, 3], type: [Number] })
    @IsArray()
    @IsOptional()
    tagIds?: number[];

    @ApiPropertyOptional({ description: 'Curio box ID related to the post', example: 5 })
    @IsOptional()
    @IsNumber()
    curioBoxId?: number;
}
