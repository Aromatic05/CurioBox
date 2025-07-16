import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getItemById, type IItem } from "../../api/itemApi";
import { removeUserItem } from "../../api/userItemApi";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import RarityChip from "../../components/store/RarityChip";

const ItemDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<IItem | null>(null);
    const location = useLocation();
    const [count, setCount] = useState<number>(1); // 删除数量，默认为1
    const [maxCount, setMaxCount] = useState<number>(1); // 当前拥有数量
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                const res = await getItemById(Number(id));
                setItem(res.data);
                // 优先用 location.state.count
                const stateCount = location.state && typeof location.state.count === 'number' ? location.state.count : 1;
                setMaxCount(stateCount);
                setCount(1);
            } catch {
                setError("无法加载物品详情。");
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, location.state]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await removeUserItem(Number(id), count);
            navigate(-1); // 返回上一页
        } catch {
            setError("删除失败，请重试。");
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

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
    if (!item) return null;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                物品详情
            </Typography>
            <Card sx={{ maxWidth: 400, mx: "auto" }}>
                {item.image && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={item.image}
                        alt={item.name}
                    />
                )}
                <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                        <Chip label={`稀有度：${item.rarity ?? "未知"}`} />
                        {item.rarity && <RarityChip rarity={item.rarity} />}
                    </Box>
                    <Typography sx={{ mt: 2 }}>{item.category ?? ""}</Typography>
                    <Typography sx={{ mt: 2 }} color="primary">数量：{maxCount}</Typography>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mt: 3 }}
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={deleting}
                    >
                        删除该物品
                    </Button>
                </CardContent>
            </Card>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography>确定要删除该物品吗？此操作不可撤销。</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                            <Typography>数量：</Typography>
                            <input
                                type="number"
                                min={1}
                                max={maxCount}
                                value={count}
                                onChange={e => setCount(Math.max(1, Math.min(maxCount, Number(e.target.value))))}
                                style={{ width: 60 }}
                                disabled={deleting}
                            />
                            <Typography color="text.secondary">/ {maxCount}</Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
                    <Button onClick={handleDelete} color="error" disabled={deleting || count < 1 || count > maxCount}>
                        {deleting ? "删除中..." : `确认删除${count > 1 ? `（${count}个）` : ""}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ItemDetailPage;
