import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getPosts, type IPost } from "../../api/showcaseApi";
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

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await getPosts();
                setPosts(response.data.items);
            } catch (err) {
                setError("无法加载帖子列表。");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
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
