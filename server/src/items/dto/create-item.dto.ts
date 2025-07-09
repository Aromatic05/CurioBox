import { IsString, IsNotEmpty, IsNumber, IsUrl, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  image: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsString()
  @IsNotEmpty()
  rarity: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  curioBoxIds: number[];
}