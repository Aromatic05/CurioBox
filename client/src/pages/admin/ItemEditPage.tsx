import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import {
    getItemById,
    createItem,
    updateItem,
    uploadItemImage,
} from "../../api/itemApi";

const rarities = [
    { value: "common", label: "普通" },
    { value: "rare", label: "稀有" },
    { value: "epic", label: "史诗" },
    { value: "legendary", label: "传奇" },
];

const ItemEditPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: "",
        category: "",
        rarity: "",
        stock: "",
        image: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            getItemById(Number(id))
                .then((res) => {
                    setForm({
                        name: res.data.name || "",
                        category: res.data.category || "",
                        rarity: res.data.rarity || "",
                        stock: res.data.stock?.toString() || "",
                        image: res.data.image || "",
                    });
                    setPreview(res.data.image || "");
                })
                .catch(() => setError("加载物品信息失败"))
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
        if (!imageFile) return form.image;
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await uploadItemImage(formData);
        return res.data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const imageUrl = await handleUploadImage();
            const payload = {
                ...form,
                stock: Number(form.stock),
                image: imageUrl,
            };
            if (isEdit) {
                await updateItem(Number(id), payload);
            } else {
                await createItem(payload);
            }
            navigate("/admin/items");
        } catch {
            setError("提交失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                {isEdit ? "编辑物品" : "新建物品"}
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="物品名称"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="分类"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    select
                    label="稀有度"
                    name="rarity"
                    value={form.rarity}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                >
                    {rarities.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="库存"
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" component="label">
                        上传图片
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </Button>
                    {preview && (
                        <Box sx={{ mt: 1 }}>
                            <img
                                src={preview}
                                alt="预览"
                                style={{
                                    width: 120,
                                    height: 120,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                }}
                            />
                        </Box>
                    )}
                </Box>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : isEdit ? (
                        "保存修改"
                    ) : (
                        "新建物品"
                    )}
                </Button>
            </form>
        </Box>
    );
};

export default ItemEditPage;
