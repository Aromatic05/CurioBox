// src/components/layout/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Tooltip,
    Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import "./Navbar.css";

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <AppBar
            position="static"
            sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
            className="navbar-appbar"
        >
            <Toolbar className="navbar-toolbar">
                <Typography
                    variant="h5"
                    component="div"
                    className="navbar-title"
                >
                    <Link to="/" className="navbar-link">
                        <span className="navbar-brand">CurioBox</span>
                    </Link>
                </Typography>
                <Box className="navbar-navbox">
                    <Tooltip title="玩家秀">
                        <IconButton
                            component={Link}
                            to="/showcase"
                            className="navbar-showcase-btn"
                        >
                            <EmojiEventsIcon />
                        </IconButton>
                    </Tooltip>
                    {isAuthenticated ? (
                        <>
                            <Tooltip title="个人中心">
                                <IconButton
                                    component={Link}
                                    to="/user"
                                    style={{
                                        transition: "transform 0.3s",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    {user?.avatar ? (
                                        <Avatar
                                            className="navbar-avatar"
                                            src={user.avatar}
                                        />
                                    ) : user?.nickname ? (
                                        <Avatar className="navbar-avatar">
                                            {user.nickname[0].toUpperCase()}
                                        </Avatar>
                                    ) : user?.username ? (
                                        <Avatar className="navbar-avatar">
                                            {user.username[0].toUpperCase()}
                                        </Avatar>
                                    ) : (
                                        <AccountCircleIcon
                                            sx={{ fontSize: 36, color: "#fff" }}
                                        />
                                    )}
                                    <Typography
                                        sx={{
                                            ml: 1,
                                            fontSize: 16,
                                            color: "rgba(255,255,255,0.9)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {user?.nickname ||
                                            user?.username ||
                                            "个人中心"}
                                    </Typography>
                                </IconButton>
                            </Tooltip>
                            <Button
                                onClick={handleLogout}
                                className="navbar-logout-btn"
                            >
                                登出
                            </Button>
                        </>
                    ) : (
                        <Button
                            component={Link}
                            to="/login"
                            className="navbar-login-btn"
                        >
                            登录/注册
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
