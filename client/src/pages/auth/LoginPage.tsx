import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser, fetchUserData } from "../../api/authApi";
import { useNavigate, useLocation } from "react-router-dom";

// 引入 MUI 组件
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
} from "@mui/material";
import apiClient from "../../api/apiClient";

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const loginResponse = await loginUser({ username, password });
            const { accessToken } = loginResponse.data;

            // 登录成功后，用新 token 获取用户信息
            apiClient.defaults.headers.common["Authorization"] =
                `Bearer ${accessToken}`;
            const userResponse = await fetchUserData();

            // 更新全局状态
            auth.login(accessToken, userResponse.data);

            // 跳转到之前的页面或首页
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    "登录失败，请检查您的用户名和密码",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 3, // 使用 MUI 的 elevation 效果
                }}
            >
                <Typography component="h1" variant="h5">
                    登录 CurioBox
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="用户名"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="密码"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            "登 录"
                        )}
                    </Button>
                </Box>
                <Button
                    fullWidth
                    variant="text"
                    sx={{ mb: 1 }}
                    onClick={() => navigate("/register")}
                >
                    没有账号？请先注册
                </Button>
            </Box>
        </Container>
    );
};

export default LoginPage;
