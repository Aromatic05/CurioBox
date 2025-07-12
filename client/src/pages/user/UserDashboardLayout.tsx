import React from 'react';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import { Container, Tabs, Tab, Box } from '@mui/material';

const UserDashboardLayout: React.FC = () => {
  const location = useLocation();

  // 根据当前路径确定选中的Tab
  const currentTab = location.pathname;

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={currentTab} aria-label="个人中心导航">
          <Tab label="我的仓库" value="/user/warehouse" to="/user/warehouse" component={RouterLink} />
          <Tab label="开箱记录" value="/user/history" to="/user/history" component={RouterLink} />
          <Tab label="我的帖子" value="/user/posts" to="/user/posts" component={RouterLink} />
        </Tabs>
      </Box>
      {/* 子页面将在这里渲染 */}
      <Outlet />
    </Container>
  );
};

export default UserDashboardLayout;