import React from 'react';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import { Container, Tabs, Tab, Box } from '@mui/material';

const UserDashboardLayout: React.FC = () => {
  const location = useLocation();

  const tabValues = ["/user/warehouse", "/user/history", "/user/posts", "/user/settings"];
  const currentTab = tabValues.includes(location.pathname) ? location.pathname : "/user/warehouse";

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={currentTab} aria-label="个人中心导航">
          <Tab label="我的仓库" value="/user/warehouse" to="/user/warehouse" component={RouterLink} />
          <Tab label="开箱记录" value="/user/history" to="/user/history" component={RouterLink} />
          <Tab label="我的帖子" value="/user/posts" to="/user/posts" component={RouterLink} />
          <Tab label="个人设置" value="/user/settings" to="/user/settings" component={RouterLink} />
        </Tabs>
      </Box>
      {/* 子页面将在这里渲染 */}
      <Outlet />
    </Container>
  );
};

export default UserDashboardLayout;