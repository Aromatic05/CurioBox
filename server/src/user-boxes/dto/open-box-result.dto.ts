import { Item } from '../../items/entities/item.entity';

export class OpenBoxResultDto {
    userBoxId: number;
    drawnItem: Item | null;  // 开启时显示已确定的物品
    success: boolean;
}

export class BatchOpenBoxResultDto {
    results: OpenBoxResultDto[];
    totalOpened: number;
    allSuccess: boolean;
}