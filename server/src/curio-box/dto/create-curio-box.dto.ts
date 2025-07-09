import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, IsArray, ValidateNested, ArrayNotEmpty, IsNumber as IsNumberField, IsPositive, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemProbabilityDto {
  @IsNumberField()
  @IsPositive()
  itemId: number;

  @IsNumberField()
  probability: number;
}

export class CreateCurioBoxDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumberField({}, { each: true })
  itemIds: number[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemProbabilityDto)
  itemProbabilities: ItemProbabilityDto[];
}