import React from 'react';
import { Chip } from '@mui/material';

// 定义组件接收的 props 类型
interface RarityChipProps {
    // 我们允许 string 类型以增加灵活性，防止后端传来未预定义的稀有度时程序崩溃
    rarity: 'common' | 'rare' | 'super_rare' | 'legendary' | string;
}

const RarityChip: React.FC<RarityChipProps> = ({ rarity }) => {
    // 定义稀有度到MUI颜色的映射
    const colorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
        common: 'default',
        rare: 'primary',
        super_rare: 'secondary',
        legendary: 'error',
    };

    // 将稀有度文本首字母大写，例如 'super_rare' -> 'Super Rare'
    const formattedLabel = rarity.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    const chipColor = colorMap[rarity] || 'default';

    return <Chip label={formattedLabel} color={chipColor} size="small" />;
};

export default RarityChip;