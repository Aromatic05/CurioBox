import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, IsArray, ValidateNested, IsNumber as IsNumberField, IsPositive, IsDefined } from 'class-validator';
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

  @IsOptional()
  @IsArray()
  @IsNumberField({}, { each: true })
  itemIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemProbabilityDto)
  itemProbabilities?: ItemProbabilityDto[];
}