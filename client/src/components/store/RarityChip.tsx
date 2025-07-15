import React from "react";
import { Chip } from "@mui/material";

interface RarityChipProps {
    rarity: "common" | "rare" | "epic" | "legendary" | string;
}

const rarityLabel: Record<string, string> = {
    common: "普通",
    rare: "稀有",
    epic: "史诗",
    super_rare: "超级稀有", // 兼容旧数据
    legendary: "传奇",
};

const RarityChip: React.FC<RarityChipProps> = ({ rarity }) => {
    if (rarity === "legendary") {
        return (
            <Chip
                label={rarityLabel[rarity] || rarity}
                size="small"
                sx={{
                    background:
                        "linear-gradient(90deg, #FFD700 0%, #FFF8DC 50%, #FFA500 100%)",
                    color: "#7c5200",
                    fontWeight: 700,
                    boxShadow: "0 0 8px 2px #FFD700",
                    border: "1px solid #FFD700",
                }}
            />
        );
    }
    if (rarity === "epic" || rarity === "super_rare") {
        return (
            <Chip
                label={rarityLabel[rarity] || rarity}
                size="small"
                sx={{
                    backgroundColor: "#a259ec",
                    color: "#fff",
                    fontWeight: 700,
                    border: "none",
                }}
            />
        );
    }
    if (rarity === "rare") {
        return (
            <Chip
                label={rarityLabel[rarity] || rarity}
                size="small"
                sx={{
                    backgroundColor: "#ff9800",
                    color: "#fff",
                    fontWeight: 700,
                    border: "none",
                }}
            />
        );
    }
    if (rarity === "common") {
        return (
            <Chip
                label={rarityLabel[rarity] || rarity}
                size="small"
                sx={{
                    backgroundColor: "#fff",
                    color: "#333",
                    fontWeight: 700,
                    border: "1px solid #eee",
                }}
            />
        );
    }
    // 未知类型兜底
    return (
        <Chip label={rarityLabel[rarity] || rarity} size="small" />
    );
};

export default RarityChip;
