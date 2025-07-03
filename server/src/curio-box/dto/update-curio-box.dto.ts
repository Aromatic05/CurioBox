import { PartialType } from '@nestjs/mapped-types';
import { CreateCurioBoxDto } from './create-curio-box.dto';

export class UpdateCurioBoxDto extends PartialType(CreateCurioBoxDto) {}
