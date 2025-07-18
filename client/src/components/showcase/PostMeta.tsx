import React from "react";
import { Box, Typography } from "@mui/material";
import LikeButton from './LikeButton';

interface PostMetaProps {
    username?: string;
    createdAt: string;
    views?: number;
    likes?: number;
    postId?: number;
    showLikeButton?: boolean;
}


const PostMeta: React.FC<PostMetaProps> = ({ username, createdAt, views, likes, postId, showLikeButton }) => (
    <Box sx={{ mb: 2, color: "text.secondary", display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" component="span">
            作者: {username || "Anonymous"}
        </Typography>
        <Typography variant="body2" component="span" sx={{ ml: 2 }}>
            发布于: {new Date(createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2" component="span" sx={{ ml: 2 }}>
            浏览量: {views ?? 0}
        </Typography>
        {showLikeButton && postId ? (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <LikeButton postId={postId} initialCount={likes ?? 0} size="small" />
            </Box>
        ) : (
            typeof likes === 'number' && (
                <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                    点赞: {likes}
                </Typography>
            )
        )}
    </Box>
);

export default PostMeta;
