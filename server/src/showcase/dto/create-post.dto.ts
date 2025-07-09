import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

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
}