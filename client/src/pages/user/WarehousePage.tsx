import React, { useEffect, useState } from 'react';
import { getMyBoxes, openBox, type IUserBox } from '../../api/orderApi';
import type { IItem } from '../../api/itemApi';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Backdrop,
} from '@mui/material';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

import BoxOpenAnimation, { shake } from '../../components/BoxOpenAnimation';

// 开箱结果弹窗组件
const OpenResultDialog: React.FC<{ item: IItem | null; onClose: () => void }> = ({ item, onClose }) => {
    if (!item) return null;
    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle align="center">恭喜你获得！</DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}>
                <Box
                    component="img"
                    src={item.image}
                    alt={item.name}
                    sx={{ maxWidth: '100%', height: 'auto', my: 2 }}
                />
                <DialogContentText variant="h5" color="primary">{item.name}</DialogContentText>
                <Typography variant="body2" color="text.secondary">稀有度: {item.rarity}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>太棒了！</Button>
            </DialogActions>
        </Dialog>
    );
};


const WarehousePage: React.FC = () => {
    const [unopenedBoxes, setUnopenedBoxes] = useState<IUserBox[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openingId, setOpeningId] = useState<number | null>(null);
    const [openedItem, setOpenedItem] = useState<IItem | null>(null);

    const fetchUnopenedBoxes = async () => {
        try {
            setLoading(true);
            const response = await getMyBoxes('UNOPENED');
            setUnopenedBoxes(response.data.boxes);
        } catch (err) {
            setError('无法加载您的仓库，请稍后再试。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnopenedBoxes();
    }, []);

    // 开箱动画升级
    const [animating, setAnimating] = useState(false);
    const [, setShakingId] = useState<number | null>(null);
    const [centerBox, setCenterBox] = useState<IUserBox | null>(null);
    const [centerStep, setCenterStep] = useState<'move' | 'shake' | null>(null);
    const handleOpenBox = async (userBoxId: number) => {
        setOpeningId(userBoxId);
        setAnimating(true);
        setShakingId(null);
        const box = unopenedBoxes.find(b => b.id === userBoxId) || null;
        setCenterBox(box);
        setCenterStep('move');
        // 先移动到中间，动画持续 1.8 秒
        setTimeout(() => {
            setCenterStep('shake');
            setTimeout(async () => {
                setShakingId(userBoxId);
                try {
                    const response = await openBox({ userBoxId });
                    const drawnItem = response.data.results[0]?.drawnItem;
                    if (drawnItem) {
                        setOpenedItem(drawnItem);
                        fetchUnopenedBoxes();
                    }
                } catch (err) {
                    alert('开箱失败！');
                } finally {
                    setOpeningId(null);
                    setAnimating(false);
                    setShakingId(null);
                    setCenterBox(null);
                    setCenterStep(null);
                }
            }, 700); // 抖动动画 0.7 秒
        }, 1800);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;


    return (
        <Box sx={{ position: 'relative' }}>
            {/* 页面暗化效果 */}
            <Backdrop open={animating} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'rgba(0,0,0,0.25)' }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>我的仓库 (未开启)</Typography>
            {unopenedBoxes.length === 0 ? (
                <Typography>你的仓库是空的，快去商店逛逛吧！</Typography>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {unopenedBoxes.map((userBox) => (
                        <Box key={userBox.id} sx={{ flex: '1 1 300px', maxWidth: 400, minWidth: 260 }}>
                            {/* 动画期间，卡片列表不渲染动画卡片，只渲染普通卡片 */}
                            <Card
                                sx={{
                                    boxShadow: 3,
                                    borderRadius: 4,
                                    bgcolor: 'background.paper',
                                    // 卡片列表不再有 shake 动画
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={userBox.curioBox.coverImage || 'https://via.placeholder.com/300x160'}
                                    alt={userBox.curioBox.name}
                                    sx={{ objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h6" align="center" color="secondary.main">{userBox.curioBox.name}</Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="secondary"
                                        size="large"
                                        onClick={() => handleOpenBox(userBox.id)}
                                        disabled={openingId === userBox.id || animating}
                                        sx={{ fontSize: 18, py: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                                    >
                                        {(openingId === userBox.id && animating)
                                            ? <CircularProgress size={28} color="secondary" />
                                            : <><CardGiftcardIcon sx={{ mr: 1 }} />立即开启</>}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}
            {/* 居中渲染动画卡片，整个动画期间都保持固定位置和 key，避免 step 切换导致跳动 */}
            {(centerBox && animating) && (
                <Box
                    key={centerBox.id}
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: (theme) => theme.zIndex.drawer + 2,
                        animation: centerStep === 'shake' ? `${shake} 0.7s` : undefined,
                        transition: 'none', // 禁止定位变化动画
                    }}
                >
                    <BoxOpenAnimation userBox={centerBox} step={centerStep as 'move' | 'shake'} />
                </Box>
            )}
            <OpenResultDialog item={openedItem} onClose={() => setOpenedItem(null)} />
            <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                *开箱动画升级，抽取结果更精彩！
            </Typography>
        </Box>
    );
};

export default WarehousePage;