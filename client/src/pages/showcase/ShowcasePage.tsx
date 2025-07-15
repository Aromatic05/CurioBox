import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getPosts, getTags, getPostsByTagId, type IPost, type ITag } from "../../api/showcaseApi";
import PostCard from "../../components/showcase/PostCard";
import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const ShowcasePage: React.FC = () => {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tags, setTags] = useState<ITag[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'comprehensive'>('latest');

    useEffect(() => {
        // 加载所有标签
        getTags()
            .then(res => setTags(res.data))
            .catch(() => setTags([]));
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                let response;
                if (selectedTagId) {
                    response = await getPostsByTagId(selectedTagId, { sortBy });
                } else {
                    response = await getPosts(1, 10, sortBy); // 传递 sortBy 参数
                }
                setPosts(response.data.items);
            } catch (err) {
                setError("无法加载帖子列表。");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [selectedTagId, sortBy]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h3" component="h1">
                    玩家秀
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    component={RouterLink}
                    to="/showcase/create"
                >
                    发布新帖子
                </Button>
            </Box>
            {/* 排序和标签筛选分两行展示 */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Button
                        variant={sortBy === 'latest' ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        onClick={() => setSortBy('latest')}
                    >
                        最新
                    </Button>
                    <Button
                        variant={sortBy === 'hot' ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        onClick={() => setSortBy('hot')}
                    >
                        热门
                    </Button>
                    <Button
                        variant={sortBy === 'comprehensive' ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        onClick={() => setSortBy('comprehensive')}
                    >
                        综合
                    </Button>
                </Box>
                {tags.length > 0 && (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                            variant={selectedTagId === null ? "contained" : "outlined"}
                            color="secondary"
                            size="small"
                            onClick={() => setSelectedTagId(null)}
                        >
                            全部
                        </Button>
                        {tags.map(tag => (
                            <Button
                                key={tag.id}
                                variant={selectedTagId === tag.id ? "contained" : "outlined"}
                                color="secondary"
                                size="small"
                                onClick={() => setSelectedTagId(tag.id)}
                            >
                                {tag.name}
                            </Button>
                        ))}
                    </Box>
                )}
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {posts.map((post) => (
                        <Box
                            key={post.id}
                            sx={{
                                width: {
                                    xs: "100%",
                                    sm: "48%",
                                    md: "31%",
                                    lg: "23%",
                                },
                                mb: 4,
                            }}
                        >
                            <PostCard post={post} />
                        </Box>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default ShowcasePage;
