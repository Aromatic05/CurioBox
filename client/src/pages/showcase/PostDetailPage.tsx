import React, { useEffect, useState } from "react";
import Markdown from "markdown-to-jsx";
import { useParams } from "react-router-dom";
import { getPostById, getCommentsByPostId, addCommentToPost, updatePostById, deleteCommentById } from "../../api/showcaseApi";
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
import { useAuth } from "../../context/useAuth";
import { buildCommentTree } from "../../components/showcase/buildCommentTree";
import CommentItem from "../../components/showcase/CommentItem";
import TagList from "../../components/showcase/TagList";
import CurioBoxLink from "../../components/showcase/CurioBoxLink";
import PostMeta from "../../components/showcase/PostMeta";
import PostEditForm from "../../components/showcase/PostEditForm";


const PostDetailPage: React.FC = () => {
    // 盲盒名称和跳转逻辑
    const [curioBoxName, setCurioBoxName] = useState<string | null>(null);
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
            await addCommentToPost(id, commentContent);
            // 重新拉取评论，保证用户信息完整
            const commentsResponse = await getCommentsByPostId(id);
            setComments(commentsResponse.data);
            setCommentContent("");
        } catch (err) {
            console.log(err);
            setSubmitError("评论失败，请重试。");
        } finally {
            setSubmitting(false);
        }
    };

    // 回复评论
    const handleReplySubmit = async (parentId: number, content: string) => {
        if (!content.trim() || !id) return;
        try {
            await addCommentToPost(id, content, parentId);
            // 重新拉取评论，保证用户信息完整
            const commentsResponse = await getCommentsByPostId(id);
            setComments(commentsResponse.data);
        } catch (err) {
            // 可选：全局错误处理
            console.log(err);
        }
    };

    // 删除评论相关
    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm("确定要删除这条评论吗？")) return;
        try {
            await deleteCommentById(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            console.log(err);
            alert("删除失败，请重试。");
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
                console.log(err);
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
            console.log(err);
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
                    <PostEditForm
                        title={editTitle}
                        content={editContent}
                        loading={editLoading}
                        error={editError}
                        onTitleChange={setEditTitle}
                        onContentChange={setEditContent}
                        onSave={handleEditSave}
                        onCancel={() => setEditing(false)}
                    />
                ) : (
                    <>
                        <Typography variant="h3" component="h1" gutterBottom>
                            {post.title}
                        </Typography>
                        {/* 标签展示组件 */}
                        <TagList tags={(post.tags || []).map(tag => ({ ...tag, description: tag.description ?? undefined }))} />
                        {/* 帖子作者与元信息展示组件 */}
                        <PostMeta
                            username={post.user?.username}
                            createdAt={post.createdAt}
                            views={post.views}
                        />
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
                        {/* 盲盒跳转链接展示组件 */}
                        {post.curioBoxId && (
                            <CurioBoxLink curioBoxId={post.curioBoxId} curioBoxName={curioBoxName} />
                        )}
                        <Markdown
                            options={{
                                forceBlock: true,
                                overrides: {
                                    h1: { component: Typography, props: { variant: "h4", gutterBottom: true } },
                                    h2: { component: Typography, props: { variant: "h5", gutterBottom: true } },
                                    h3: { component: Typography, props: { variant: "h6", gutterBottom: true } },
                                    p: { component: Typography, props: { variant: "body1", sx: { mt: 2, whiteSpace: "pre-wrap", mb: 0 } } },
                                },
                            }}
                        >
                            {post.content}
                        </Markdown>
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
                {comments.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        暂无评论
                    </Typography>
                ) : (
                    buildCommentTree(comments).map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            depth={0}
                            onReply={handleReplySubmit}
                            onDelete={handleDeleteComment}
                            currentUserId={currentUser?.id}
                        />
                    ))
                )}
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
