import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Box,
    CardActions,
} from "@mui/material";
import type { IPost } from "../../api/showcaseApi";
import { getCurioBoxById } from "../../api/curioBoxApi";
import Tooltip from '@mui/material/Tooltip';
import LikeButton from './LikeButton';

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
                    {/* 标签展示（只显示名称） */}
                    {post.tags && post.tags.length > 0 && (
                        <Box sx={{ mb: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {post.tags.map(tag => (
                                <Box
                                    key={tag.id}
                                    sx={{
                                        px: 1.2,
                                        py: 0.3,
                                        bgcolor: "#e0f7fa",
                                        borderRadius: 1,
                                        fontSize: 13,
                                        color: "#00796b",
                                        fontWeight: 500,
                                    }}
                                >
                                    {tag.name}
                                </Box>
                            ))}
                        </Box>
                    )}
                    {/* 盲盒信息展示（已移至CardActions） */}
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
            <CardActions sx={{ pl: 1, pt: 0, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }} disableSpacing>
                {/* 盲盒链接 */}
                {post.curioBoxId && (
                    <Tooltip title="查看盲盒详情">
                        <span>
                            <Typography
                                variant="body2"
                                color="primary"
                                sx={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/box/${post.curioBoxId}`);
                                }}
                            >
                                盲盒: {curioBoxName || `ID: ${post.curioBoxId}`}
                            </Typography>
                        </span>
                    </Tooltip>
                )}
                {/* 点赞按钮和数量组件化 */}
                <LikeButton postId={post.id} initialCount={post.likes || 0} size="small" />
            </CardActions>
        </Card>
    );
};

export default PostCard;
