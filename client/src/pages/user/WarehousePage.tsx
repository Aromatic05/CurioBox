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
} from '@mui/material';

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

  const handleOpenBox = async (userBoxId: number) => {
    setOpeningId(userBoxId);
    try {
      const response = await openBox({ userBoxId });
      const drawnItem = response.data.results[0]?.drawnItem;
      if (drawnItem) {
        setOpenedItem(drawnItem);
        // 刷新列表
        fetchUnopenedBoxes();
      }
    } catch (err) {
      alert('开箱失败！');
    } finally {
      setOpeningId(null);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>我的仓库 (未开启)</Typography>
      {unopenedBoxes.length === 0 ? (
        <Typography>你的仓库是空的，快去商店逛逛吧！</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {unopenedBoxes.map((userBox) => (
            <Box key={userBox.id} sx={{ flex: '1 1 300px', maxWidth: 400, minWidth: 260 }}>
              <Card>
                <CardMedia
                  component="img"
                  height="160"
                  image={userBox.curioBox.coverImage || 'https://via.placeholder.com/300x160'}
                  alt={userBox.curioBox.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">{userBox.curioBox.name}</Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpenBox(userBox.id)}
                    disabled={openingId === userBox.id}
                  >
                    {openingId === userBox.id ? <CircularProgress size={24} /> : '立即开启'}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
      <OpenResultDialog item={openedItem} onClose={() => setOpenedItem(null)} />
    </Box>
  );
};

export default WarehousePage;