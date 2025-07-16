import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import RarityChip from "../../components/store/RarityChip";

const ItemWarehousePage: React.FC = () => {
    type ItemWithCount = (IItem & { count: number }) | { id: number; name: string; count: number };
    const [items, setItems] = useState<ItemWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
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
                const itemsWithDetail: ItemWithCount[] = await Promise.all(detailPromises);
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
                    {items.map((item) => {
                        // 判断 item 是否为 IItem & { count: number }
                        const isFullItem = (it: ItemWithCount): it is IItem & { count: number } => {
                            return "image" in it || "rarity" in it;
                        };
                        return (
                            <Box
                                key={item.id}
                                sx={{
                                    width: { xs: "100%", sm: "48%", md: "31%", lg: "23%" },
                                    minWidth: 220,
                                    maxWidth: 320,
                                    flex: "1 1 220px",
                                }}
                            >
                                <Card sx={{ height: "100%" }}>
                                    {isFullItem(item) && item.image && (
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={item.image}
                                            alt={item.name}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {item.name}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                                            <Chip label={`数量：${item.count}`} color="primary" />
                                            {isFullItem(item) && item.rarity && (
                                                <RarityChip rarity={item.rarity} />
                                            )}
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <Chip
                                                label="详情"
                                                color="info"
                                                clickable
                                                onClick={() => navigate(`/user/items/${item.id}`, { state: { count: item.count } })}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default ItemWarehousePage;
