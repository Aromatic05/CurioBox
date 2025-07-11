import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';
import type { ICurioBox } from '../../api/curioBoxApi'; // 从您的API文件导入类型

interface CurioBoxCardProps {
  box: ICurioBox;
}

const CurioBoxCard: React.FC<CurioBoxCardProps> = ({ box }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={RouterLink} to={`/box/${box.id}`}>
        <CardMedia
          component="img"
          height="200"
          // 您可以将这里的占位符图片替换为 box.coverImage 属性
          image={box.coverImage || '哈哈哈'}
          alt={box.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {box.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {box.category}
            </Typography>
            <Typography variant="h6" color="primary">
              ¥{box.price.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CurioBoxCard;