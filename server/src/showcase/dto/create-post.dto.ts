import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsArray()
    @IsString({ each: true })
    images: string[];

    @IsArray()
    @IsOptional()
    tagIds?: number[];

    @IsOptional()
    @IsNumber()
    curioBoxId?: number;
}
