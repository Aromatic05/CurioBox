import { Item } from '../../items/entities/item.entity';

export class OpenBoxResultDto {
    userBoxId: number;
    drawnItem: Item | null;
    success: boolean;
}

export class BatchOpenBoxResultDto {
    results: OpenBoxResultDto[];
    totalOpened: number;
    allSuccess: boolean;
}