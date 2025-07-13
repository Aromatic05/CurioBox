import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById, getCommentsByPostId, addCommentToPost } from '../../api/showcaseApi';
import type { IComment, IPost } from '../../api/showcaseApi';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Divider, TextField, Button } from '@mui/material';

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<IPost | null>(null);
    const [comments, setComments] = useState<IComment[]>([]);
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                setError('无法加载帖子详情。');
            } finally {
                setLoading(false);
            }
        };
        fetchPostDetails();
    }, [id]);

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
            setComments(prev => [...prev, res.data]);
            setCommentContent('');
        } catch (err) {
            console.log(err);
            setSubmitError('评论失败，请重试。');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
    if (!post) return <Typography>帖子未找到。</Typography>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    {post.title}
                </Typography>
                <Box sx={{ mb: 2, color: 'text.secondary' }}>
                    <Typography variant="body2" component="span">
                        作者: {post.user?.username || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                        发布于: {new Date(post.createdAt).toLocaleString()}
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                {post.images?.map((image, index) => (
                    <Box
                        component="img"
                        key={index}
                        src={image}
                        alt={`post image ${index + 1}`}
                        sx={{ maxWidth: '100%', my: 2, borderRadius: 1 }}
                    />
                ))}
                <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                    {post.content}
                </Typography>
            </Paper>

            {/* 评论区模仿 GitHub，MUI 风格卡片和按钮 */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>评论</Typography>
                <Divider sx={{ mb: 2 }} />
                {comments.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>暂无评论</Typography>
                )}
                {comments.map(comment => (
                    <Box key={comment.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        {/* 头像 */}
                        <Box sx={{ width: 40, height: 40, mr: 2 }}>
                            <Box sx={{ width: 40, height: 40, bgcolor: 'grey.300', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="h6" color="text.secondary">
                                    {comment.user?.username ? comment.user.username[0].toUpperCase() : '匿'}
                                </Typography>
                            </Box>
                        </Box>
                        <Paper elevation={2} sx={{ flex: 1, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {comment.user?.username || '匿名'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                    {new Date(comment.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Typography>
                        </Paper>
                    </Box>
                ))}
                {/* 发表评论输入框 */}
                <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ width: 40, height: 40, mr: 2 }}>
                            <Box sx={{ width: 40, height: 40, bgcolor: 'grey.300', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="h6" color="text.secondary">
                                    {post.user?.username ? post.user.username[0].toUpperCase() : '匿'}
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentContent(e.target.value)}
                                placeholder="发表你的评论..."
                                disabled={submitting}
                                sx={{ mb: 1 }}
                            />
                            {submitError && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{submitError}</Typography>}
                            <Box sx={{ textAlign: 'right', mt: 1 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleCommentSubmit}
                                    disabled={submitting || !commentContent.trim()}
                                >
                                    {submitting ? '正在发表...' : '发表评论'}
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