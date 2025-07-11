import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress } from '@mui/material';
import { getCurioBoxById, createCurioBox, updateCurioBox, uploadCurioBoxImage } from '../../api/curioBoxApi';

const categories = [
    { value: '潮玩', label: '潮玩' },
    { value: '手办', label: '手办' },
    { value: '文创', label: '文创' },
    { value: '其他', label: '其他' },
];

const BoxEditPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        coverImage: '', // 封面图片URL
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            getCurioBoxById(Number(id))
                .then(res => {
                    setForm({
                        name: res.data.name || '',
                        category: res.data.category || '',
                        price: res.data.price?.toString() || '',
                        description: res.data.description || '',
                        coverImage: res.data.coverImage || '',
                    });
                    setPreview(res.data.coverImage || '');
                })
                .catch(() => setError('加载盲盒信息失败'))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadImage = async (): Promise<string> => {
        if (!imageFile) return form.coverImage;
        const formData = new FormData();
        formData.append('file', imageFile);
        const res = await uploadCurioBoxImage(formData);
        return res.data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const imageUrl = await handleUploadImage();
            const payload = {
                ...form,
                price: Number(form.price),
                coverImage: imageUrl,
            };
            if (isEdit) {
                await updateCurioBox(Number(id), payload);
            } else {
                await createCurioBox(payload);
            }
            navigate('/admin');
        } catch (err) {
            setError('提交失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                {isEdit ? '编辑盲盒' : '新建盲盒'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="盲盒名称"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    select
                    label="分类"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                >
                    {categories.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="价格"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="描述"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" component="label">
                        上传图片
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                    {preview && (
                        <Box sx={{ mt: 1 }}>
                            <img src={preview} alt="预览" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
                        </Box>
                    )}
                </Box>
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <Button type="submit" variant="contained" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : (isEdit ? '保存修改' : '新建盲盒')}
                </Button>
            </form>
        </Box>
    );
};

export default BoxEditPage;
