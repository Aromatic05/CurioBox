import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminHomePage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                maxWidth: 800,
                mx: "auto",
                mt: 6,
                p: 4,
                bgcolor: "#f7f7fa",
                borderRadius: 4,
                boxShadow: 2,
            }}
        >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                管理后台首页
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
                欢迎进入 CurioBox
                管理后台！您可以在此管理盲盒、物品、订单等数据。
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Button
                    variant="contained"
                    size="large"
                    sx={{ flex: 1, minWidth: 180 }}
                    onClick={() => navigate("/admin/boxes")}
                >
                    盲盒管理
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    sx={{ flex: 1, minWidth: 180 }}
                    onClick={() => navigate("/admin/items")}
                >
                    物品管理
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    color="info"
                    sx={{ flex: 1, minWidth: 180 }}
                    onClick={() => navigate("/admin/users")}
                >
                    用户管理
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    color="success"
                    sx={{ flex: 1, minWidth: 180 }}
                    onClick={() => navigate("/admin/orders")}
                >
                    订单管理
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    color="warning"
                    sx={{ flex: 1, minWidth: 180 }}
                    onClick={() => navigate("/admin/posts")}
                >
                    帖子管理
                </Button>
            </Box>
        </Box>
    );
};

export default AdminHomePage;
