import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, Stack } from '@mui/material';
import { setNickname } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UserProfileSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [nickname, setNicknameInput] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleNicknameSave = async () => {
    setLoading(true);
    try {
      await setNickname(nickname);
      setMessage('昵称已更新');
      refreshUser && refreshUser();
    } catch (err) {
      setMessage('昵称更新失败');
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
    formData.append('file', avatarFile);
    try {
      const res = await axios.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url;
      setAvatar(url);
      // 更新用户头像到后端
      await axios.post('/auth/set-avatar', { avatar: url });
      setMessage('头像已更新');
      refreshUser && refreshUser();
    } catch (err) {
      setMessage('头像上传失败');
    }
    setLoading(false);
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4} p={3} boxShadow={2} borderRadius={2} bgcolor="#fff">
      <Typography variant="h6" mb={2}>个人设置</Typography>
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={avatar} sx={{ width: 64, height: 64 }} />
          <Button variant="contained" component="label" disabled={loading}>
            上传新头像
            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </Button>
          <Button variant="outlined" onClick={handleAvatarUpload} disabled={loading || !avatarFile}>
            保存头像
          </Button>
        </Box>
        <TextField
          label="昵称"
          value={nickname}
          onChange={e => setNicknameInput(e.target.value)}
          fullWidth
          disabled={loading}
        />
        <Button variant="contained" onClick={handleNicknameSave} disabled={loading}>
          保存昵称
        </Button>
        {message && <Typography color="primary">{message}</Typography>}
      </Stack>
    </Box>
  );
};

export default UserProfileSettings;
