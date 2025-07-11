// src/components/layout/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar 
            position="static" 
            sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: '#fff',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            <Toolbar sx={{ minHeight: 70 }}>
                <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                        flexGrow: 1, 
                        fontWeight: 700, 
                        letterSpacing: 1.5,
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <Link 
                        to="/" 
                        style={{ 
                            textDecoration: 'none', 
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <span style={{ 
                            background: 'rgba(255,255,255,0.2)',
                            padding: '8px 12px',
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            CurioBox
                        </span>
                    </Link>
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    '& .MuiButton-root': {
                        transition: 'all 0.3s ease',
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }
                }}>
                    <Tooltip title="玩家秀">
                        <IconButton 
                            component={Link} 
                            to="/showcase"
                            sx={{
                                color: '#fff',
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            <EmojiEventsIcon />
                        </IconButton>
                    </Tooltip>
                    
                    {isAuthenticated ? (
                        <>
                            <Typography sx={{ 
                                mx: 2, 
                                fontSize: 16, 
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 500
                            }}>
                                欢迎, {user?.username}
                            </Typography>
                            
                            <Tooltip title="个人中心">
                                <IconButton 
                                    component={Link} 
                                    to="/profile"
                                    sx={{
                                        '&:hover': {
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                >
                                    {user?.username ? (
                                        <Avatar 
                                            sx={{ 
                                                width: 36, 
                                                height: 36, 
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                color: '#fff',
                                                fontWeight: 600,
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                '&:hover': {
                                                    borderColor: 'rgba(255,255,255,0.6)'
                                                }
                                            }}
                                        >
                                            {user.username[0].toUpperCase()}
                                        </Avatar>
                                    ) : (
                                        <AccountCircleIcon sx={{ fontSize: 36, color: '#fff' }} />
                                    )}
                                </IconButton>
                            </Tooltip>
                            
                            <Button 
                                onClick={handleLogout} 
                                variant="outlined"
                                sx={{
                                    borderRadius: 20,
                                    px: 3,
                                    py: 1,
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.1)',
                                        borderColor: 'rgba(255,255,255,0.6)'
                                    }
                                }}
                            >
                                登出
                            </Button>
                        </>
                    ) : (
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            sx={{
                                borderRadius: 20,
                                px: 3,
                                py: 1,
                                background: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 15px rgba(250, 208, 196, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(250, 208, 196, 0.6)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
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