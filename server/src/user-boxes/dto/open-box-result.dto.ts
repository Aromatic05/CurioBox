import { Item } from '../../items/entities/item.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenBoxResultDto {
    @ApiProperty({ description: 'ID of the user box', example: 123 })
    userBoxId: number;

    @ApiPropertyOptional({ description: 'The drawn item (null if failed)', type: () => Item, example: null })
    drawnItem: Item | null;

    @ApiProperty({ description: 'Whether the open was successful', example: true })
    success: boolean;
}

export class BatchOpenBoxResultDto {
    @ApiProperty({ description: 'Results of each open', type: [OpenBoxResultDto] })
    results: OpenBoxResultDto[];

    @ApiProperty({ description: 'Total number of boxes opened', example: 3 })
    totalOpened: number;

    @ApiProperty({ description: 'Whether all opens were successful', example: true })
    allSuccess: boolean;
}
