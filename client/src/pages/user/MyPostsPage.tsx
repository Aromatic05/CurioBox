import React, { useEffect, useState } from "react";
import { getMyPosts, getLikedPosts, type IPost } from "../../api/showcaseApi";
import PostCard from "../../components/showcase/PostCard"; // 复用已有的帖子卡片组件
import { Typography, CircularProgress, Alert, Box } from "@mui/material";

const MyPostsPage: React.FC = () => {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [likedPosts, setLikedPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedLoading, setLikedLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [likedError, setLikedError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                setLoading(true);
                const response = await getMyPosts();
                setPosts(response.data.items);
            } catch (err) {
                console.log(err);
                setError("无法加载您的帖子列表。");
            } finally {
                setLoading(false);
            }
        };
        const fetchLikedPosts = async () => {
            try {
                setLikedLoading(true);
                const response = await getLikedPosts();
                setLikedPosts(response.data);
            } catch (err) {
                console.log(err);
                setLikedError("无法加载您点赞过的帖子。");
            } finally {
                setLikedLoading(false);
            }
        };
        fetchMyPosts();
        fetchLikedPosts();
    }, []);

    if (loading || likedLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                我发布的帖子
            </Typography>
            {posts.length === 0 ? (
                <Typography>
                    你还没有发布过任何帖子，快去分享你的战利品吧！
                </Typography>
            ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 6 }}>
                    {posts.map((post) => (
                        <Box
                            key={post.id}
                            sx={{
                                flex: "1 1 300px",
                                maxWidth: 400,
                                minWidth: 260,
                            }}
                        >
                            <PostCard post={post} />
                        </Box>
                    ))}
                </Box>
            )}

            <Typography variant="h4" gutterBottom sx={{ mt: 6 }}>
                我点赞过的帖子
            </Typography>
            {likedError && <Alert severity="error">{likedError}</Alert>}
            {likedPosts.length === 0 ? (
                <Typography>
                    你还没有点赞过任何帖子。
                </Typography>
            ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {likedPosts.map((post) => (
                        <Box
                            key={post.id}
                            sx={{
                                flex: "1 1 300px",
                                maxWidth: 400,
                                minWidth: 260,
                            }}
                        >
                            <PostCard post={post} />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default MyPostsPage;
