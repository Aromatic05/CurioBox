import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

// 示例盲盒数据
const demoBoxes = [
  {
    id: 1,
    name: 'Labubu 泡泡玛特盲盒',
    coverImage: 'https://img.popmart.com.cn/cover/labubu.jpg',
    items: [
      { name: 'Labubu-稀有款', image: 'https://img.popmart.com.cn/item/labubu-rare.jpg', rarity: '超稀有' },
      { name: 'Labubu-普通款', image: 'https://img.popmart.com.cn/item/labubu-normal.jpg', rarity: '普通' },
      { name: 'Labubu-隐藏款', image: 'https://img.popmart.com.cn/item/labubu-secret.jpg', rarity: '隐藏' },
    ],
  },
];

function getRandomItem(items: any[]) {
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

const OpenResultDialog: React.FC<{ item: any; onClose: () => void }> = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle align="center">恭喜你获得！</DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Box component="img" src={item.image} alt={item.name} sx={{ maxWidth: '100%', height: 'auto', my: 2 }} />
        <DialogContentText variant="h5" color="primary">{item.name}</DialogContentText>
        <Typography variant="body2" color="text.secondary">稀有度: {item.rarity}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>再抽一次！</Button>
      </DialogActions>
    </Dialog>
  );
};

const DemoLabubuDraw: React.FC = () => {
  const [opening, setOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState<any | null>(null);

  const handleOpenBox = () => {
    setOpening(true);
    setTimeout(() => {
      const item = getRandomItem(demoBoxes[0].items);
      setOpenedItem(item);
      setOpening(false);
    }, 1200);
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6, p: 3, boxShadow: 3, borderRadius: 4, bgcolor: '#fff' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#e91e63' }}>
        Labubu 盲盒抽取
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardMedia
          component="img"
          height="180"
          image={demoBoxes[0].coverImage}
          alt={demoBoxes[0].name}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" align="center">{demoBoxes[0].name}</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            泡泡玛特粉丝专属抽奖活动，快来试试你的手气吧！
          </Typography>
        </CardContent>
      </Card>
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        size="large"
        onClick={handleOpenBox}
        disabled={opening}
        sx={{ fontSize: 18, py: 1.5, fontWeight: 600 }}
      >
        {opening ? <CircularProgress size={28} /> : '立即抽取'}
      </Button>
      <OpenResultDialog item={openedItem} onClose={() => setOpenedItem(null)} />
      <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: '#888' }}>
        *本页面仅为演示，抽取结果为随机生成
      </Typography>
    </Box>
  );
};

export default DemoLabubuDraw;
