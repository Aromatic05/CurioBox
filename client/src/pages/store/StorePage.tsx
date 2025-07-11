import React, { useEffect, useState } from 'react';
import { getCurioBoxes, type ICurioBox } from '../../api/curioBoxApi';
import CurioBoxCard from '../../components/store/CurioBoxCard';
import {
  Container,
  Typography,
  Box,
  Alert,
  Skeleton,
} from '@mui/material';

const StorePage: React.FC = () => {
  const [boxes, setBoxes] = useState<ICurioBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        setLoading(true);
        const response = await getCurioBoxes();
        setBoxes(response.data);
      } catch (err) {
        setError('无法加载盲盒列表，请稍后再试。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  const renderSkeletons = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
      {Array.from(new Array(8)).map((_, index) => (
        <Box key={index} sx={{ width: { xs: '100%', sm: '48%', md: '31%', lg: '23%' }, mb: 4 }}>
          <Skeleton variant="rectangular" height={200} />
          <Skeleton />
          <Skeleton width="60%" />
        </Box>
      ))}
    </Box>
  );

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom align="center">
        探索所有盲盒
      </Typography>

      {loading ? (
        renderSkeletons()
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 4,
          justifyContent: 'center',
          width: '100%'
        }}>
          {boxes.map((box) => (
            <Box key={box.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%', lg: '23%' }, mb: 4 }}>
              <CurioBoxCard box={box} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default StorePage;