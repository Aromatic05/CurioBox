import React, { useEffect, useState } from "react";
import { getUserItems } from "../../api/userItemApi";
import { getItemById, type IItem } from "../../api/itemApi";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    Chip
} from "@mui/material";

const ItemWarehousePage: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const userItems = await getUserItems();
                // 并发获取物品详情
                const detailPromises = userItems.map(async (userItem: { itemId: number; count: number }) => {
                    try {
                        const res = await getItemById(userItem.itemId);
                        return { ...res.data, count: userItem.count };
                    } catch {
                        // 物品已被删除或异常，只展示数量和ID
                        return { id: userItem.itemId, name: `物品 #${userItem.itemId}`, count: userItem.count };
                    }
                });
                const itemsWithDetail: IItem[] = await Promise.all(detailPromises);
                setItems(itemsWithDetail);
            } catch (err) {
                setError("无法加载您的物品仓库，请稍后再试。");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                我的物品仓库
            </Typography>
            {items.length === 0 ? (
                <Typography>您还没有获得任何物品。</Typography>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        mt: 2,
                    }}
                >
                    {items.map((item) => (
                        <Box
                            key={item.id ?? item.itemId}
                            sx={{
                                width: { xs: "100%", sm: "48%", md: "31%", lg: "23%" },
                                minWidth: 220,
                                maxWidth: 320,
                                flex: "1 1 220px",
                            }}
                        >
                            <Card sx={{ height: "100%" }}>
                                {item.image && (
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={item.image}
                                        alt={item.name}
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {item.name || `物品 #${item.itemId}`}
                                    </Typography>
                                    <Chip label={`数量：${item.count}`} color="primary" sx={{ mb: 1 }} />
                                    {item.rarity && (
                                        <Chip label={item.rarity} color="secondary" sx={{ ml: 1 }} />
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default ItemWarehousePage;
