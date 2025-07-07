import { IsString, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  image: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  @IsNotEmpty()
  curioBoxId: number; // <-- 新增此字段
}