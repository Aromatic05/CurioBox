import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Stack,
} from "@mui/material";
import { setNickname, uploadAvatar } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";

const UserProfileSettings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [nickname, setNicknameInput] = useState(user?.nickname || "");
    const [avatar, setAvatar] = useState<string>(user?.avatar || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState("");

    const handleNicknameSave = async () => {
        setLoading(true);
        try {
            await setNickname(nickname);
            setMessage("昵称已更新");
            refreshUser && refreshUser();
        } catch (err) {
            setMessage("昵称更新失败");
        }
        setLoading(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", avatarFile);
        try {
            const res = await uploadAvatar(formData);
            const url = res.data.url;
            setAvatar(url);
            // 更新用户头像到后端
            await apiClient.post("/auth/set-avatar", { avatar: url });
            setMessage("头像已更新");
            refreshUser && refreshUser();
        } catch (err) {
            setMessage("头像上传失败");
        }
        setLoading(false);
    };

    // 修改密码
    const handleChangePassword = async () => {
        setLoading(true);
        setPasswordMsg("");
        try {
            await apiClient.post("/auth/change-password", {
                oldPassword,
                newPassword,
            });
            setPasswordMsg("密码已修改，请重新登录");
            setOldPassword("");
            setNewPassword("");
        } catch (err) {
            setPasswordMsg("密码修改失败，请检查原密码");
        }
        setLoading(false);
    };

    // 删除账号
    const handleDeleteAccount = async () => {
        setLoading(true);
        setDeleteMsg("");
        try {
            await apiClient.post("/auth/delete-user");
            setDeleteMsg("账号已删除，您将被登出");
            // 可选：登出并跳转首页
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } catch (err) {
            setDeleteMsg("删除失败，请重试");
        }
        setLoading(false);
    };

    return (
        <Box
            maxWidth={400}
            mt={4}
            p={3}
            boxShadow={2}
            borderRadius={2}
            bgcolor="background.paper"
        >
            <Typography variant="h6" mb={2}>
                个人设置
            </Typography>
            <Stack spacing={3}>
                {/* 头像设置 */}
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={avatar} sx={{ width: 64, height: 64 }} />
                    <Button
                        variant="contained"
                        component="label"
                        disabled={loading}
                    >
                        上传新头像
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleAvatarUpload}
                        disabled={loading || !avatarFile}
                    >
                        保存头像
                    </Button>
                </Box>
                {/* 昵称设置 */}
                <TextField
                    label="昵称"
                    value={nickname}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    fullWidth
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    onClick={handleNicknameSave}
                    disabled={loading}
                >
                    保存昵称
                </Button>
                {message && <Typography color="primary">{message}</Typography>}

                {/* 修改密码 */}
                <Typography variant="subtitle1">修改密码</Typography>
                <TextField
                    label="原密码"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    fullWidth
                    disabled={loading}
                />
                <TextField
                    label="新密码"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleChangePassword}
                    disabled={loading || !oldPassword || !newPassword}
                >
                    修改密码
                </Button>
                {passwordMsg && <Typography color="warning.main">{passwordMsg}</Typography>}

                {/* 删除账号 */}
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                >
                    删除账号
                </Button>
            </Stack>
            {/* 删除账号确认弹窗 */}
            {deleteDialogOpen && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    width="100vw"
                    height="100vh"
                    bgcolor="rgba(0,0,0,0.3)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={9999}
                >
                    <Box bgcolor="background.paper" p={4} borderRadius={2} boxShadow={3} minWidth={300}>
                        <Typography mb={2}>
                            确定要删除账号吗？此操作不可恢复。
                        </Typography>
                        {deleteMsg && <Typography color="error">{deleteMsg}</Typography>}
                        <Stack direction="row" spacing={2} mt={2}>
                            <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
                                取消
                            </Button>
                            <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={loading}>
                                确认删除
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default UserProfileSettings;
