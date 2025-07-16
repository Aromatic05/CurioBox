import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurioBoxById } from "../../api/curioBoxApi";
import type { ICurioBox } from "../../api/curioBoxApi";
import type { IItem } from "../../api/itemApi";
import { purchaseCurioBox } from "../../api/orderApi";
import { useAuth } from "../../context/useAuth";
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    Snackbar,
} from "@mui/material";
import RarityChip from "../../components/store/RarityChip";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { getItemById as fetchItemById } from "../../api/itemApi";
import { getPostsByCurioBoxId } from "../../api/showcaseApi";
import PostCard from "../../components/showcase/PostCard";

const CurioBoxDetailPage: React.FC = () => {
    const [box, setBox] = useState<ICurioBox | null>(null);
    // 相关帖子
    const [relatedPosts, setRelatedPosts] = useState<import("../../api/showcaseApi").IPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    useEffect(() => {
        if (!box?.id) return;
        setPostsLoading(true);
        getPostsByCurioBoxId(box.id, 1, 6)
            .then(res => setRelatedPosts(res.data.items || []))
            .catch(() => setRelatedPosts([]))
            .finally(() => setPostsLoading(false));
    }, [box?.id]);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [itemDetails, setItemDetails] = useState<Record<number, IItem>>({});

    // 购买数量
    const [quantity, setQuantity] = useState(1);

    // Snackbar 状态
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        if (!id) return;
        const fetchBox = async () => {
            try {
                setLoading(true);
                const response = await getCurioBoxById(Number(id));
                setBox(response?.data ?? response);
            } catch (err) {
                setError("无法加载盲盒详情。");
            } finally {
                setLoading(false);
            }
        };
        fetchBox();
    }, [id]);

    // 获取所有物品详情
    useEffect(() => {
        if (!box || !box.itemProbabilities) return;
        const fetchAllItems = async () => {
            const ids = (box.itemProbabilities ?? []).map((p) => p.itemId);
            const promises = ids.map((id) =>
                fetchItemById(id)
                    .then((res) => res.data)
                    .catch(() => undefined),
            );
            const results = await Promise.all(promises);
            const details: Record<number, IItem> = {};
            results.forEach((item, idx) => {
                if (item) details[ids[idx]] = item;
            });
            setItemDetails(details);
        };
        fetchAllItems();
    }, [box]);

    const handlePurchase = async () => {
        if (!box) return;
        setPurchaseLoading(true);
        try {
            await purchaseCurioBox({ curioBoxId: box.id, quantity });
            setSnackbar({
                open: true,
                message: "购买成功！已添加到您的仓库。",
                severity: "success",
            });
            // 可选：延迟一会跳转到仓库页面
            setTimeout(() => navigate("/user/warehouse"), 2000);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || "购买失败，库存可能不足。";
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error",
            });
        } finally {
            setPurchaseLoading(false);
        }
    };

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    if (error || !box)
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error || "未找到该盲盒。"}
            </Alert>
        );

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            {/* 返回按钮 */}
            <Box sx={{ mb: 2 }}>
                <Button variant="text" onClick={() => window.history.back()}>
                    返回
                </Button>
            </Box>
            <Paper elevation={3}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Box
                            component="img"
                            src={
                                box.coverImage ||
                                `https://via.placeholder.com/600x400?text=${box.name}`
                            }
                            alt={box.name}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            p: 4,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Typography variant="h3" component="h1" gutterBottom>
                            {box.name}
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            paragraph
                        >
                            {box.description}
                        </Typography>
                        <Typography variant="h4" color="primary" sx={{ my: 2 }}>
                            ¥{box.price.toFixed(2)}
                        </Typography>
                        {/* 剩余数量显示 */}
                        <Typography
                            variant="body2"
                            color={
                                box.boxCount === 0 ? "error" : "text.secondary"
                            }
                            sx={{ mb: 1 }}
                        >
                            剩余盲盒数量：
                            {typeof box.boxCount === "number"
                                ? box.boxCount
                                : "未知"}
                        </Typography>
                        {/* 购买数量选择器 */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                购买数量：
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 32, px: 0 }}
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                disabled={quantity <= 1 || purchaseLoading}
                            >
                                -
                            </Button>
                            <Typography
                                variant="body1"
                                sx={{
                                    mx: 2,
                                    minWidth: 32,
                                    textAlign: "center",
                                }}
                            >
                                {quantity}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 32, px: 0 }}
                                onClick={() => setQuantity((q) => q + 1)}
                                disabled={
                                    purchaseLoading ||
                                    (typeof box.boxCount === "number" &&
                                        quantity >= box.boxCount)
                                }
                            >
                                +
                            </Button>
                        </Box>
                        <Box sx={{ mt: "auto" }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={
                                    purchaseLoading ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    ) : (
                                        <ShoppingCartIcon />
                                    )
                                }
                                onClick={handlePurchase}
                                disabled={!isAuthenticated || purchaseLoading}
                            >
                                {purchaseLoading ? "处理中..." : "立即购买"}
                            </Button>
                            {!isAuthenticated && (
                                <Typography
                                    variant="caption"
                                    color="error"
                                    sx={{ display: "block", mt: 1 }}
                                >
                                    请先登录再进行购买
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ mt: 5 }}>
                <Typography variant="h4" gutterBottom>
                    盲盒内容物一览
                </Typography>
                <List>
                    {(box.itemProbabilities ?? []).map((prob, idx, arr) => {
                        const item = itemDetails[prob.itemId];
                        if (!item) {
                            return (
                                <ListItem key={prob.itemId}>
                                    <ListItemText
                                        primary={`未找到 itemId: ${prob.itemId}`}
                                        secondary={JSON.stringify(prob)}
                                    />
                                </ListItem>
                            );
                        }
                        return (
                            <React.Fragment key={item.id}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            src={
                                                item.image ||
                                                "https://via.placeholder.com/56"
                                            }
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                mr: 2,
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`概率: ${(prob.probability * 100).toFixed(1)}%`}
                                    />
                                    <RarityChip rarity={item.rarity} />
                                </ListItem>
                                {idx !== arr.length - 1 && (
                                    <Divider variant="inset" component="li" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>
            <Box sx={{ mt: 6 }}>
                <Typography variant="h4" gutterBottom>
                    相关玩家秀帖子
                </Typography>
                {postsLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : relatedPosts.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        暂无相关帖子
                    </Typography>
                ) : (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
                        {relatedPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </Box>
                )}
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CurioBoxDetailPage;
