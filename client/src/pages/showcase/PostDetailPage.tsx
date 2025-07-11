import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById, getCommentsByPostId } from '../../api/showcaseApi';
import type { IComment, IPost } from '../../api/showcaseApi';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Divider } from '@mui/material';

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<IPost | null>(null);
    const [comments, setComments] = useState<IComment[]>([]);
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
                        作者: {post.author?.username || 'Anonymous'}
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

            {/* 评论区将放在这里 */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>评论</Typography>
                {/* CommentSection component would go here */}
                {comments.map(comment => (
                    <Paper key={comment.id} sx={{ p: 2, mt: 2, bgcolor: 'grey.100' }}>
                        <Typography variant="subtitle2">
                            {comment.author?.username || '匿名'}
                        </Typography>
                        <Typography variant="body2">{comment.content}</Typography>
                    </Paper>
                ))}
            </Box>
        </Container>
    );
};

export default PostDetailPage;