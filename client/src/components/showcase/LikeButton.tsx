import React, { useEffect, useState } from "react";
import { IconButton, Tooltip, Typography, Box } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { likePost, unlikePost, isPostLiked } from '../../api/showcaseApi';

interface LikeButtonProps {
    postId: number;
    initialLiked?: boolean;
    initialCount?: number;
    size?: "small" | "medium";
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLiked = false, initialCount = 0, size = "small" }) => {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialCount);
    const [likeLoading, setLikeLoading] = useState(false);

    useEffect(() => {
        isPostLiked(postId)
            .then(res => setLiked(res.data.liked))
            .catch(() => setLiked(false));
        setLikeCount(initialCount);
        // eslint-disable-next-line
    }, [postId, initialCount]);

    const handleLike = async () => {
        if (likeLoading) return;
        setLikeLoading(true);
        try {
            if (liked) {
                await unlikePost(postId);
                setLiked(false);
                setLikeCount(c => Math.max(0, c - 1));
            } else {
                await likePost(postId);
                setLiked(true);
                setLikeCount(c => c + 1);
            }
        } catch (err) {
            // 可选：toast错误
            console.log(err)
        } finally {
            setLikeLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={liked ? '取消点赞' : '点赞'}>
                <span>
                    <IconButton
                        color={liked ? 'error' : 'default'}
                        onClick={handleLike}
                        disabled={likeLoading}
                        size={size}
                    >
                        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                </span>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {likeCount}
            </Typography>
        </Box>
    );
};

export default LikeButton;
