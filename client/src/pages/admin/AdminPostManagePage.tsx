import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, IconButton, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getPosts, getCommentsByPostId, deleteCommentById, type IPost, type IComment } from "../../api/showcaseApi";

const AdminPostManagePage: React.FC = () => {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [commentsMap, setCommentsMap] = useState<Record<number, IComment[]>>({});
    const [deleting, setDeleting] = useState<{[key:number]: boolean}>({});
    const [deletingPost, setDeletingPost] = useState<{[key:number]: boolean}>({});

    useEffect(() => {
        setLoading(true);
        getPosts(1, 20).then(res => {
            setPosts(res.data.items);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        posts.forEach(post => {
            getCommentsByPostId(post.id.toString()).then(res => {
                setCommentsMap(prev => ({ ...prev, [post.id]: res.data }));
            });
        });
    }, [posts]);

    const handleDeleteComment = async (commentId: number, postId: number) => {
        setDeleting(prev => ({ ...prev, [commentId]: true }));
        await deleteCommentById(commentId);
        // 删除后刷新评论
        const res = await getCommentsByPostId(postId.toString());
        setCommentsMap(prev => ({ ...prev, [postId]: res.data }));
        setDeleting(prev => ({ ...prev, [commentId]: false }));
    };

    const handleDeletePost = async (postId: number) => {
        setDeletingPost(prev => ({ ...prev, [postId]: true }));
        const { deletePostById } = await import("../../api/showcaseApi");
        await deletePostById(postId);
        // 删除后刷新帖子列表
        setPosts(prev => prev.filter(post => post.id !== postId));
        setDeletingPost(prev => ({ ...prev, [postId]: false }));
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 6, p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                帖子管理
            </Typography>
            {loading ? <CircularProgress /> : (
                posts.map(post => (
                    <Paper key={post.id} sx={{ mb: 4, p: 2, position: "relative" }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>{post.title}</Typography>
                            <IconButton
                                color="error"
                                size="small"
                                disabled={!!deletingPost[post.id]}
                                onClick={() => handleDeletePost(post.id)}
                                sx={{ ml: 1 }}
                            >
                                {deletingPost[post.id] ? <CircularProgress size={20} /> : <DeleteIcon />}
                            </IconButton>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>{post.content}</Typography>
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>评论：</Typography>
                        {(commentsMap[post.id] || []).length === 0 ? (
                            <Typography variant="body2" color="text.secondary">暂无评论</Typography>
                        ) : (
                            (commentsMap[post.id] || []).map((comment: IComment) => (
                                <Box key={comment.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {comment.user.username}: {comment.content}
                                    </Typography>
                                    <IconButton
                                        color="error"
                                        size="small"
                                        disabled={!!deleting[comment.id]}
                                        onClick={() => handleDeleteComment(comment.id, post.id)}
                                    >
                                        {deleting[comment.id] ? <CircularProgress size={20} /> : <DeleteIcon />}
                                    </IconButton>
                                </Box>
                            ))
                        )}
                    </Paper>
                ))
            )}
        </Box>
    );
};

export default AdminPostManagePage;
