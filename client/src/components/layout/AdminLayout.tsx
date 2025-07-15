// src/components/layout/AdminLayout.tsx
import React from "react";
import { Outlet, Link as RouterLink } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    CssBaseline,
    AppBar,
    Typography,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox"; // 示例图标
import MailIcon from "@mui/icons-material/Mail"; // 示例图标

const drawerWidth = 240;

const AdminLayout: React.FC = () => {
    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        CurioBox 后台管理
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {/* 侧边栏菜单项 */}
                        <ListItem
                            disablePadding
                            component={RouterLink}
                            to="/admin/boxes"
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon>
                                <ListItemText primary="盲盒管理" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem
                            disablePadding
                            component={RouterLink}
                            to="/admin/items"
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    <MailIcon />
                                </ListItemIcon>
                                <ListItemText primary="物品管理" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem
                            disablePadding
                            component={RouterLink}
                            to="/admin/users"
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon>
                                <ListItemText primary="用户管理" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem
                            disablePadding
                            component={RouterLink}
                            to="/admin/orders"
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    <MailIcon />
                                </ListItemIcon>
                                <ListItemText primary="订单管理" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem
                            disablePadding
                            component={RouterLink}
                            to="/admin/posts"
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon>
                                <ListItemText primary="帖子管理" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet /> {/* 子页面将在这里渲染 */}
            </Box>
        </Box>
    );
};

export default AdminLayout;
