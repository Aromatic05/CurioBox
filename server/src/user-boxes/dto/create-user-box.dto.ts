import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserBoxDto {
    @IsNumber()
    @IsNotEmpty()
    curioBoxId: number;

    @IsNumber()
    @IsOptional()
    quantity?: number = 1; // 默认购买数量为1，支持批量购买
}