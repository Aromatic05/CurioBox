import React, { useEffect, useState } from 'react';
import { getMyPosts, type IPost } from '../../api/showcaseApi';
import PostCard from '../../components/showcase/PostCard'; // 复用已有的帖子卡片组件
import { Typography, CircularProgress, Alert, Box } from '@mui/material';

const MyPostsPage: React.FC = () => {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                setLoading(true);
                const response = await getMyPosts();
                setPosts(response.data.items);
            } catch (err) {
                setError('无法加载您的帖子列表。');
            } finally {
                setLoading(false);
            }
        };
        fetchMyPosts();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>我发布的帖子</Typography>
            {posts.length === 0 ? (
                <Typography>你还没有发布过任何帖子，快去分享你的战利品吧！</Typography>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {posts.map((post) => (
                        <Box key={post.id} sx={{ flex: '1 1 300px', maxWidth: 400, minWidth: 260 }}>
                            <PostCard post={post} />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default MyPostsPage;