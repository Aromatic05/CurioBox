import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, IsArray, ValidateNested, IsNumber as IsNumberField, IsPositive, IsDefined } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

  @Transform(({ value }) => Number(value))
  @IsNumber()
  price: number;

  @IsOptional()
  // @IsUrl()
  coverImage?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string' && value.startsWith('[')) try { return JSON.parse(value).map(Number); } catch { return []; }
    if (typeof value === 'string') return [Number(value)];
    if (typeof value === 'number') return [value];
    return [];
  })
  @IsArray()
  @IsNumberField({}, { each: true })
  itemIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? JSON.parse(v) : v);
    if (typeof value === 'string' && value.startsWith('[')) try { return JSON.parse(value); } catch { return []; }
    if (typeof value === 'string') try { return [JSON.parse(value)]; } catch { return []; }
    return [];
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemProbabilityDto)
  itemProbabilities?: ItemProbabilityDto[];
}