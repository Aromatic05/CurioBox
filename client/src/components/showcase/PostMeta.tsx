import React from "react";
import { Box, Typography } from "@mui/material";

interface PostMetaProps {
    username?: string;
    createdAt: string;
    views?: number;
}

const PostMeta: React.FC<PostMetaProps> = ({ username, createdAt, views }) => (
    <Box sx={{ mb: 2, color: "text.secondary" }}>
        <Typography variant="body2" component="span">
            作者: {username || "Anonymous"}
        </Typography>
        <Typography variant="body2" component="span" sx={{ ml: 2 }}>
            发布于: {new Date(createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2" component="span" sx={{ ml: 2 }}>
            浏览量: {views ?? 0}
        </Typography>
    </Box>
);

export default PostMeta;
