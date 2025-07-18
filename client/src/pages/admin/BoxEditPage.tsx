import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import {
    getCurioBoxById,
    createCurioBox,
    updateCurioBox,
    uploadCurioBoxImage,
} from "../../api/curioBoxApi";
import { getItems, type IItem } from "../../api/itemApi";

const BoxEditPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: "",
        category: "",
        price: "",
        description: "",
        coverImage: "", // 封面图片URL
        boxCount: "", // 盲盒数量
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 物品相关
    const [allItems, setAllItems] = useState<IItem[]>([]); // 所有物品
    const [selectedItems, setSelectedItems] = useState<IItem[]>([]); // 选中的物品
    const [itemProbabilities, setItemProbabilities] = useState<
        { itemId: number; probability: number }[]
    >([]);

    // 获取所有物品
    useEffect(() => {
        getItems()
            .then((res) => setAllItems(res.data))
            .catch(() => setAllItems([]));
    }, []);

    // 编辑模式下加载盲盒详情
    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            getCurioBoxById(Number(id))
                .then((res) => {
                    setForm({
                        name: res.data.name || "",
                        category: res.data.category || "",
                        price: res.data.price?.toString() || "",
                        description: res.data.description || "",
                        coverImage: res.data.coverImage || "",
                        boxCount: res.data.boxCount?.toString() || "",
                    });
                    setPreview(res.data.coverImage || "");
                    setItemProbabilities(res.data.itemProbabilities || []);
                    // 根据 itemProbabilities 的 itemId 反查物品
                    if (res.data.itemProbabilities && allItems.length > 0) {
                        const selected = res.data.itemProbabilities
                            .map((ip: { itemId: number }) =>
                                allItems.find((ai) => ai.id === ip.itemId),
                            )
                            .filter(Boolean) as IItem[];
                        setSelectedItems(selected);
                    } else {
                        setSelectedItems([]);
                    }
                })
                .catch(() => setError("加载盲盒信息失败"))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, allItems]);

    // allItems加载后，修正selectedItems为allItems中的引用
    useEffect(() => {
        if (isEdit && allItems.length > 0 && selectedItems.length > 0) {
            const fixed = selectedItems.map(
                (item) => allItems.find((ai) => ai.id === item.id) || item,
            );
            setSelectedItems(fixed);
        }
    }, [isEdit, allItems]);

    // 物品选择变化
    const handleItemsChange = (_: unknown, value: IItem[]) => {
        setSelectedItems(value);
        // 保持概率数组与选中物品同步
        const newProb = value.map((item) => {
            const found = itemProbabilities.find((ip) => ip.itemId === item.id);
            return found || { itemId: item.id, probability: 0 };
        });
        setItemProbabilities(newProb);
    };

    // 概率输入变化
    const handleProbabilityChange = (itemId: number, value: string) => {
        setItemProbabilities((prev) =>
            prev.map((ip) =>
                ip.itemId === itemId
                    ? { ...ip, probability: Number(value) }
                    : ip,
            ),
        );
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 数量单独修改
    const handleBoxCountChange = async () => {
        if (!isEdit) return;
        setLoading(true);
        setError("");
        try {
            await import("../../api/curioBoxApi").then((api) =>
                api.updateCurioBoxCount(Number(id), Number(form.boxCount)),
            );
            setError("数量修改成功");
        } catch {
            setError("数量修改失败");
        } finally {
            setLoading(false);
        }
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
        formData.append("file", imageFile);
        const res = await uploadCurioBoxImage(formData);
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
                price: Number(form.price),
                boxCount: Number(form.boxCount),
                coverImage: imageUrl,
                itemIds: selectedItems.map((item) => item.id),
                itemProbabilities,
            };
            if (isEdit) {
                await updateCurioBox(Number(id), payload);
            } else {
                // 新建时必须传递boxCount
                await createCurioBox({ ...payload, boxCount: Number(form.boxCount) });
            }
            navigate("/admin/boxes");
        } catch {
            setError("提交失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                {isEdit ? "编辑盲盒" : "新建盲盒"}
            </Typography>
            <form onSubmit={handleSubmit}>
                {/* 盲盒数量输入框：新建时可编辑，编辑时可单独修改 */}
                {isEdit ? (
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            label="盲盒数量"
                            name="boxCount"
                            type="number"
                            value={form.boxCount}
                            onChange={handleChange}
                            fullWidth
                        />
                        <Button
                            variant="outlined"
                            sx={{ mt: 1 }}
                            onClick={handleBoxCountChange}
                            disabled={loading}
                        >
                            修改数量
                        </Button>
                    </Box>
                ) : (
                    <TextField
                        label="盲盒数量"
                        name="boxCount"
                        type="number"
                        value={form.boxCount}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        required
                    />
                )}
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
                    label="分类"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
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
                {/* 物品选择与概率设置 */}
                <Autocomplete
                    multiple
                    options={allItems}
                    getOptionLabel={(option) => option.name}
                    value={selectedItems}
                    onChange={handleItemsChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="选择物品"
                            sx={{ mb: 2 }}
                        />
                    )}
                    isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                    }
                />
                {selectedItems.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            设置物品概率（总和需为1）
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                            {selectedItems.map((item) => (
                                <Box
                                    key={
                                        item.id +
                                        "-" +
                                        itemProbabilities.find(
                                            (ip) => ip.itemId === item.id,
                                        )?.probability
                                    }
                                    sx={{
                                        width: {
                                            xs: "100%",
                                            sm: "48%",
                                            md: "31%",
                                        },
                                        mb: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography>{item.name}</Typography>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={
                                            itemProbabilities.find(
                                                (ip) => ip.itemId === item.id,
                                            )?.probability ?? 0
                                        }
                                        onChange={(e) =>
                                            handleProbabilityChange(
                                                item.id,
                                                e.target.value,
                                            )
                                        }
                                        inputProps={{
                                            step: 0.01,
                                            min: 0,
                                            max: 1,
                                        }}
                                        sx={{ width: 80 }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
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
                        "新建盲盒"
                    )}
                </Button>
            </form>
        </Box>
    );
};

export default BoxEditPage;
