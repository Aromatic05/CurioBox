import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, getTags, type ITag, type CreatePostPayload } from '../../api/showcaseApi';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    type SelectChangeEvent,
} from '@mui/material';
import { type Theme, useTheme } from '@mui/material/styles';

// MUI Select多选样式辅助函数
function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    // 表单状态
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imagesText, setImagesText] = useState(''); // 用于接收图片URL文本
    const [availableTags, setAvailableTags] = useState<ITag[]>([]);
    const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);

    // UI状态
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    // 加载可用标签
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await getTags();
                setAvailableTags(response.data);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
            }
        };
        fetchTags();
    }, []);

    const handleTagChange = (event: SelectChangeEvent<typeof selectedTagNames>) => {
        const {
            target: { value },
        } = event;
        setSelectedTagNames(typeof value === 'string' ? value.split(',') : value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!title.trim() || !content.trim()) {
            setSnackbar({ open: true, message: '标题和内容不能为空！', severity: 'error' });
            return;
        }
        setLoading(true);

        // 从标签名找到对应的标签ID
        const selectedTagIds = selectedTagNames.map(name => {
            const foundTag = availableTags.find(tag => tag.name === name);
            return foundTag ? foundTag.id : null;
        }).filter(id => id !== null) as number[];

        const payload: CreatePostPayload = {
            title,
            content,
            images: imagesText.split('\n').filter(url => url.trim() !== ''), // 将每行文本转换为数组项
            tagIds: selectedTagIds,
        };

        try {
            const response = await createPost(payload);
            setSnackbar({ open: true, message: '帖子发布成功！', severity: 'success' });
            // 延迟跳转，让用户看到成功提示
            setTimeout(() => {
                navigate(`/showcase/${response.data.id}`);
            }, 1000);
        } catch (error) {
            setSnackbar({ open: true, message: '发布失败，请稍后再试。', severity: 'error' });
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    创建新的玩家秀帖子
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="帖子标题"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="帖子内容"
                        multiline
                        rows={8}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="图片链接 (每行一个)"
                        multiline
                        rows={3}
                        value={imagesText}
                        onChange={(e) => setImagesText(e.target.value)}
                        helperText="请粘贴图片的URL，每个URL占一行。"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="multiple-tags-label">标签</InputLabel>
                        <Select
                            labelId="multiple-tags-label"
                            multiple
                            value={selectedTagNames}
                            onChange={handleTagChange}
                            input={<OutlinedInput label="标签" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {availableTags.map((tag) => (
                                <MenuItem
                                    key={tag.id}
                                    value={tag.name}
                                    style={getStyles(tag.name, selectedTagNames, theme)}
                                >
                                    {tag.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ position: 'relative', mt: 3 }}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                        >
                            立即发布
                        </Button>
                        {loading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Paper>
            {snackbar && (
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}
        </Container>
    );
};

export default CreatePostPage;