import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Box,
} from "@mui/material";
import type { IPost } from "../../api/showcaseApi";

interface PostCardProps {
    post: IPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
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
