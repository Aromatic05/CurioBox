import { IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateUserBoxDto {
    @IsNumber()
    @IsNotEmpty()
    curioBoxId: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    quantity?: number = 1; // 默认购买数量为1，支持批量购买
}