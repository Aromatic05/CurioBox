import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import apiClient from "../../api/apiClient";

interface IUser {
    id: number;
    username: string;
    role: string;
    nickname?: string;
    avatar?: string;
    status?: 'active' | 'banned' | 'deleted';
}

const UserManagePage: React.FC = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // 获取所有用户
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get("/auth/users"); // 需后端提供 GET /users 接口
                setUsers(res.data);
            } catch {
                setError("无法获取用户列表");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 删除用户（软删除）
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            await apiClient.post("/auth/delete-user", { userId: selectedUser.id });
            setUsers((prev) => prev.map(u => u.id === selectedUser.id ? { ...u, status: 'deleted' } : u));
            setDeleteDialogOpen(false);
            setSelectedUser(null);
        } catch {
            setDeleteError("删除失败，请重试");
        } finally {
            setDeleting(false);
        }
    };

    // 封禁用户
    const handleBanUser = async (user: IUser) => {
        try {
            await apiClient.post("/auth/ban-user", { userId: user.id });
            setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, status: 'banned' } : u));
        } catch {
            alert("封禁失败");
        }
    };

    // 解封用户
    const handleUnbanUser = async (user: IUser) => {
        try {
            await apiClient.post("/auth/unban-user", { userId: user.id });
            setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
        } catch {
            alert("解封失败");
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", mt: 6, p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                用户管理
            </Typography>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Paper sx={{ p: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>用户名</TableCell>
                                <TableCell>角色</TableCell>
                                <TableCell>昵称</TableCell>
                                <TableCell>头像</TableCell>
                                <TableCell>状态</TableCell>
                                <TableCell align="center">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.nickname || "-"}</TableCell>
                                    <TableCell>
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="avatar"
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell>{user.status || "-"}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setDeleteDialogOpen(true);
                                            }}
                                            disabled={user.status === 'deleted'}
                                        >
                                            删除
                                        </Button>
                                        {user.status === 'active' && (
                                            <Button
                                                color="warning"
                                                variant="outlined"
                                                size="small"
                                                sx={{ ml: 1 }}
                                                onClick={() => handleBanUser(user)}
                                            >
                                                封禁
                                            </Button>
                                        )}
                                        {user.status === 'banned' && (
                                            <Button
                                                color="success"
                                                variant="outlined"
                                                size="small"
                                                sx={{ ml: 1 }}
                                                onClick={() => handleUnbanUser(user)}
                                            >
                                                解封
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
            {/* 删除确认弹窗 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>确认删除用户</DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography>
                        确定要删除用户 <b>{selectedUser?.username}</b>{" "}
                        吗？此操作不可恢复。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleting}
                    >
                        取消
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteUser}
                        disabled={deleting}
                    >
                        {deleting ? "删除中..." : "确认删除"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagePage;
