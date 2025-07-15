import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, getCommentsByPostId, addCommentToPost, updatePostById } from "../../api/showcaseApi";
import { getCurioBoxById } from "../../api/curioBoxApi";
import type { IComment, IPost } from "../../api/showcaseApi";
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    TextField,
    Button,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const PostDetailPage: React.FC = () => {
    // 盲盒名称和跳转逻辑
    const [curioBoxName, setCurioBoxName] = useState<string | null>(null);
    const navigate = useNavigate();
    const [post, setPost] = useState<IPost | null>(null);
    useEffect(() => {
        if (post?.curioBoxId) {
            getCurioBoxById(post.curioBoxId)
                .then(res => setCurioBoxName(res.data.name || null))
                .catch(() => setCurioBoxName(null));
        } else {
            setCurioBoxName(null);
        }
    }, [post?.curioBoxId]);
    const { id } = useParams<{ id: string }>();
    const [comments, setComments] = useState<IComment[]>([]);
    const [commentContent, setCommentContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 发表评论
    const handleCommentSubmit = async () => {
        if (!commentContent.trim() || !id) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            // 直接调用已导入的 addCommentToPost
            // id 可能为 string，API 兼容 string/number
            // @ts-ignore
            const res = await addCommentToPost(id, commentContent);
            setComments((prev) => [...prev, res.data]);
            setCommentContent("");
        } catch (err) {
            console.log(err);
            setSubmitError("评论失败，请重试。");
        } finally {
            setSubmitting(false);
        }
    };

    // 编辑相关
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    // 使用 AuthContext 获取当前用户
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (!id) return;
        const fetchPostDetails = async () => {
            try {
                setLoading(true);
                const [postResponse, commentsResponse] = await Promise.all([
                    getPostById(id),
                    getCommentsByPostId(id),
                ]);
                setPost(postResponse.data);
                setComments(commentsResponse.data);
            } catch (err) {
                setError("无法加载帖子详情。");
            } finally {
                setLoading(false);
            }
        };
        fetchPostDetails();
    }, [id]);

    // 进入编辑模式时初始化编辑内容
    useEffect(() => {
        if (editing && post) {
            setEditTitle(post.title);
            setEditContent(post.content);
        }
    }, [editing, post]);

    // 编辑保存
    const handleEditSave = async () => {
        if (!editTitle.trim() || !editContent.trim() || !id) return;
        setEditLoading(true);
        setEditError(null);
        try {
            await updatePostById(id, {
                title: editTitle,
                content: editContent,
            });
            // 刷新帖子详情
            const postResponse = await getPostById(id);
            setPost(postResponse.data);
            setEditing(false);
        } catch (err) {
            setEditError("保存失败，请重试。");
        } finally {
            setEditLoading(false);
        }
    };

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    if (error)
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error}
            </Alert>
        );
    if (!post) return <Typography>帖子未找到。</Typography>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* 返回按钮 */}
            <Box sx={{ mb: 2 }}>
                <Button variant="text" onClick={() => window.history.back()}>
                    返回
                </Button>
            </Box>
            <Paper sx={{ p: 4 }}>
                {/* 编辑模式 */}
                {editing ? (
                    <>
                        <TextField
                            label="标题"
                            fullWidth
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="内容"
                            fullWidth
                            multiline
                            minRows={5}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        {editError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {editError}
                            </Alert>
                        )}
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEditSave}
                                disabled={editLoading}
                            >
                                {editLoading ? "保存中..." : "保存"}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setEditing(false)}
                                disabled={editLoading}
                            >
                                取消
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h3" component="h1" gutterBottom>
                            {post.title}
                        </Typography>
                        <Box sx={{ mb: 2, color: "text.secondary" }}>
                            <Typography variant="body2" component="span">
                                作者: {post.user?.username || "Anonymous"}
                            </Typography>
                            <Typography
                                variant="body2"
                                component="span"
                                sx={{ ml: 2 }}
                            >
                                发布于:{" "}
                                {new Date(post.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        {post.images?.map((image, index) => (
                            <Box
                                component="img"
                                key={index}
                                src={image}
                                alt={`post image ${index + 1}`}
                                sx={{
                                    maxWidth: "100%",
                                    my: 2,
                                    borderRadius: 1,
                                }}
                            />
                        ))}
                        {/* 盲盒跳转链接展示 */}
                        {post.curioBoxId && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="primary">
                                    盲盒：
                                    <span
                                        style={{ textDecoration: "underline", color: "#1976d2", cursor: "pointer" }}
                                        onClick={() => navigate(`/box/${post.curioBoxId}`)}
                                    >
                                        {curioBoxName || `ID: ${post.curioBoxId}`}
                                    </span>
                                </Typography>
                            </Box>
                        )}
                        <Typography
                            variant="body1"
                            sx={{ mt: 2, whiteSpace: "pre-wrap" }}
                        >
                            {post.content}
                        </Typography>
                        {/* 仅作者可见编辑按钮 */}
                        {currentUser?.id &&
                            post.user?.id === currentUser.id && (
                                <Box sx={{ textAlign: "right", mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => setEditing(true)}
                                    >
                                        编辑
                                    </Button>
                                </Box>
                            )}
                    </>
                )}
            </Paper>

            {/* 评论区模仿 GitHub，MUI 风格卡片和按钮 */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    评论
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {comments.length === 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        暂无评论
                    </Typography>
                )}
                {comments.map((comment) => (
                    <Box
                        key={comment.id}
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 2,
                        }}
                    >
                        {/* 头像 */}
                        <Box sx={{ width: 40, height: 40, mr: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: "grey.300",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="h6" color="text.secondary">
                                    {comment.user?.username
                                        ? comment.user.username[0].toUpperCase()
                                        : "匿"}
                                </Typography>
                            </Box>
                        </Box>
                        <Paper
                            elevation={2}
                            sx={{
                                flex: 1,
                                p: 2,
                                bgcolor: "background.paper",
                                borderRadius: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                >
                                    {comment.user?.username || "匿名"}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 2 }}
                                >
                                    {new Date(
                                        comment.createdAt,
                                    ).toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{ whiteSpace: "pre-wrap" }}
                            >
                                {comment.content}
                            </Typography>
                        </Paper>
                    </Box>
                ))}
                {/* 发表评论输入框 */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        mt: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                        <Box sx={{ width: 40, height: 40, mr: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: "grey.300",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="h6" color="text.secondary">
                                    {post.user?.username
                                        ? post.user.username[0].toUpperCase()
                                        : "匿"}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                multiline
                                minRows={3}
                                fullWidth
                                variant="outlined"
                                value={commentContent}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => setCommentContent(e.target.value)}
                                placeholder="发表你的评论..."
                                disabled={submitting}
                                sx={{ mb: 1 }}
                            />
                            {submitError && (
                                <Typography
                                    color="error"
                                    variant="body2"
                                    sx={{ mt: 1 }}
                                >
                                    {submitError}
                                </Typography>
                            )}
                            <Box sx={{ textAlign: "right", mt: 1 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleCommentSubmit}
                                    disabled={
                                        submitting || !commentContent.trim()
                                    }
                                >
                                    {submitting ? "正在发表..." : "发表评论"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default PostDetailPage;
