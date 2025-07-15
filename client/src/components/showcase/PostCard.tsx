import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Box,
} from "@mui/material";
import type { IPost } from "../../api/showcaseApi";
import { getCurioBoxById } from "../../api/curioBoxApi";

interface PostCardProps {
    post: IPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const navigate = useNavigate();
    const [curioBoxName, setCurioBoxName] = useState<string | null>(null);

    useEffect(() => {
        // 如果 curioBoxId 存在且没有 curioBox.name，则前端查一次
        if (post.curioBoxId && !post.curioBox) {
            getCurioBoxById(post.curioBoxId)
                .then(res => {
                    setCurioBoxName(res.data.name || null);
                })
                .catch(() => setCurioBoxName(null));
        } else if (post.curioBox?.name) {
            setCurioBoxName(post.curioBox.name);
        }
    }, [post.curioBoxId, post.curioBox]);
    return (
        <Card>
            <CardActionArea component={RouterLink} to={`/showcase/${post.id}`}>
                <CardMedia
                    component="img"
                    height="180"
                    image={
                        post.images?.[0] || 
                        `https://via.placeholder.com/300x180?text=No+Image`
                    }
                    alt={post.title}
                />
                <CardContent>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {post.title}
                    </Typography>
                    {/* 盲盒信息展示 */}
                    {post.curioBoxId && (
                        <Box sx={{ mb: 1 }}>
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
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "text.secondary",
                        }}
                    >
                        <Typography variant="body2">
                            by {post.user?.username || "Anonymous"}
                        </Typography>
                        <Typography variant="body2">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PostCard;
