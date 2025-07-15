import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    createPost,
    getTags,
    type ITag,
    type CreatePostPayload,
} from "../../api/showcaseApi";
import { getMyBoxes, type IUserBox } from "../../api/orderApi";
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
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { uploadItemImage } from "../../api/itemApi";

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
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]); // 用于接收图片文件
    const [imagePreviews, setImagePreviews] = useState<string[]>([]); // 图片预览URL
    const [availableTags, setAvailableTags] = useState<ITag[]>([]);
    const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
    // 新增：已开启盲盒选择
    const [openedBoxes, setOpenedBoxes] = useState<IUserBox[]>([]);
    // 选中的 curioBoxId（不是 userBox.id）
    const [selectedBoxId, setSelectedBoxId] = useState<number | "">("");

    // UI状态
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    } | null>(null);

    // 加载可用标签和已开启盲盒（去重）
    useEffect(() => {
        const fetchTagsAndBoxes = async () => {
            try {
                const [tagsRes, boxesRes] = await Promise.all([
                    getTags(),
                    getMyBoxes("OPENED"),
                ]);
                setAvailableTags(tagsRes.data);
                // 去重，只保留唯一的 curioBox（按 curioBox.id）
                const uniqueBoxesMap = new Map<number, IUserBox>();
                for (const box of boxesRes.data.boxes) {
                    if (box.curioBox && !uniqueBoxesMap.has(box.curioBox.id)) {
                        uniqueBoxesMap.set(box.curioBox.id, box);
                    }
                }
                const uniqueBoxes = Array.from(uniqueBoxesMap.values());
                setOpenedBoxes(uniqueBoxes);
            } catch (error) {
                console.error("Failed to fetch tags or boxes:", error);
            }
        };
        fetchTagsAndBoxes();
    }, []);

    const handleTagChange = (
        event: SelectChangeEvent<typeof selectedTagNames>,
    ) => {
        const {
            target: { value },
        } = event;
        setSelectedTagNames(
            typeof value === "string" ? value.split(",") : value,
        );
    };

    // 处理图片选择
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter((f) =>
                f.type.startsWith("image/"),
            );
            setImageFiles(files); // 允许多选
            setImagePreviews(files.map((file) => URL.createObjectURL(file)));
        }
    };

    // 多图片上传，返回所有图片URL
    const uploadImages = async (files: File[]): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file); // 字段名必须为 file
            const res = await uploadItemImage(formData);
            urls.push(res.data.url);
        }
        return urls;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!title.trim() || !content.trim()) {
            setSnackbar({
                open: true,
                message: "标题和内容不能为空！",
                severity: "error",
            });
            return;
        }
        if (!selectedBoxId) {
            setSnackbar({
                open: true,
                message: "请选择已开启的盲盒！",
                severity: "error",
            });
            return;
        }
        setLoading(true);

        // 从标签名找到对应的标签ID
        const selectedTagIds = selectedTagNames
            .map((name) => {
                const foundTag = availableTags.find((tag) => tag.name === name);
                return foundTag ? foundTag.id : null;
            })
            .filter((id) => id !== null) as number[];

        let imageUrls: string[] = [];
        if (imageFiles.length > 0) {
            try {
                imageUrls = await uploadImages(imageFiles);
            } catch (err) {
                setSnackbar({
                    open: true,
                    message: "图片上传失败",
                    severity: "error",
                });
                setLoading(false);
                return;
            }
        }
        const payload: CreatePostPayload = {
            title,
            content,
            images: imageUrls,
            tagIds: selectedTagIds,
            curioBoxId: typeof selectedBoxId === "number" ? selectedBoxId : undefined,
        };
        try {
            const response = await createPost(payload);
            setSnackbar({
                open: true,
                message: "帖子发布成功！",
                severity: "success",
            });
            setTimeout(() => {
                navigate(`/showcase/${response.data.id}`);
            }, 1000);
        } catch (error) {
            setSnackbar({
                open: true,
                message: "发布失败，请稍后再试。",
                severity: "error",
            });
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            {/* 返回按钮 */}
            <Box sx={{ mb: 2 }}>
                <Button variant="text" onClick={() => window.history.back()}>
                    返回
                </Button>
            </Box>
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
                    <Box marginY={2}>
                        <Button variant="outlined" component="label">
                            上传图片
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={handleImageChange}
                            />
                        </Button>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            支持多张图片上传，图片将自动上传并用于帖子展示。
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                mt: 2,
                            }}
                        >
                            {imagePreviews.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`预览${idx + 1}`}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        border: "1px solid #eee",
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="multiple-tags-label">标签</InputLabel>
                        <Select
                            labelId="multiple-tags-label"
                            multiple
                            value={selectedTagNames}
                            onChange={handleTagChange}
                            input={<OutlinedInput label="标签" />}
                            renderValue={(selected) => (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                    }}
                                >
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
                                    style={getStyles(
                                        tag.name,
                                        selectedTagNames,
                                        theme,
                                    )}
                                >
                                    {tag.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* 新增：选择已开启盲盒 */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="select-box-label">选择已开启盲盒</InputLabel>
                        <Select
                            labelId="select-box-label"
                            value={selectedBoxId}
                            onChange={(e) => setSelectedBoxId(Number(e.target.value))}
                            input={<OutlinedInput label="选择已开启盲盒" />}
                        >
                            <MenuItem value="">
                                <em>请选择盲盒</em>
                            </MenuItem>
                            {openedBoxes.map((box) => (
                                <MenuItem key={box.curioBox.id} value={box.curioBox.id}>
                                    {box.curioBox?.name || `盲盒ID: ${box.curioBox?.id}`}
                                </MenuItem>
                            ))}
                        </Select>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            只能选择已开启的盲盒，评价更客观。
                        </Typography>
                    </FormControl>
                    <Box sx={{ position: "relative", mt: 3 }}>
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
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    marginTop: "-12px",
                                    marginLeft: "-12px",
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
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSnackbar(null)}
                        severity={snackbar.severity}
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}
        </Container>
    );
};

export default CreatePostPage;
