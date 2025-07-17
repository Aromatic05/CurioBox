import React from "react";
import Markdown from "markdown-to-jsx";
import { Typography, Box, Paper, TextField, Button } from "@mui/material";
import type { IComment } from "../../api/showcaseApi";

export type CommentTree = IComment & { children: CommentTree[] };

export interface CommentItemProps {
    comment: CommentTree;
    depth: number;
    onReply: (parentId: number, content: string) => Promise<void>;
    onDelete: (commentId: number) => void;
    currentUserId?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, depth, onReply, onDelete, currentUserId }) => {
    const [showReply, setShowReply] = React.useState(false);
    const [localReplyContent, setLocalReplyContent] = React.useState("");
    const [localReplySubmitting, setLocalReplySubmitting] = React.useState(false);
    const [localReplyError, setLocalReplyError] = React.useState<string | null>(null);

    const handleLocalReplySubmit = async () => {
        if (!localReplyContent.trim()) return;
        setLocalReplySubmitting(true);
        setLocalReplyError(null);
        try {
            await onReply(comment.id, localReplyContent);
            setLocalReplyContent("");
            setShowReply(false);
        } catch (err) {
            setLocalReplyError("回复失败，请重试。");
        } finally {
            setLocalReplySubmitting(false);
        }
    };

    return (
        <Box sx={{ ml: depth * 3, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Box sx={{ width: 40, height: 40, mr: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "grey.300",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="h6" color="text.secondary">
                            {comment.user?.username
                                ? comment.user.username[0].toUpperCase()
                                : "匿"}
                        </Typography>
                    </Box>
                </Box>
                <Paper
                    elevation={2}
                    sx={{
                        flex: 1,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        position: "relative",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {comment.user?.username || "匿名"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                        {currentUserId === comment.user?.id && (
                            <Button
                                size="small"
                                color="error"
                                variant="text"
                                sx={{ ml: 2 }}
                                onClick={() => onDelete(comment.id)}
                            >
                                删除
                            </Button>
                        )}
                        <Button
                            size="small"
                            color="primary"
                            variant="text"
                            sx={{ ml: 2 }}
                            onClick={() => setShowReply((v) => !v)}
                        >
                            {showReply ? "取消回复" : "回复"}
                        </Button>
                    </Box>
                    <Markdown
                        options={{
                            forceBlock: true,
                            overrides: {
                                h1: { component: Typography, props: { variant: "h6", gutterBottom: true } },
                                h2: { component: Typography, props: { variant: "subtitle1", gutterBottom: true } },
                                h3: { component: Typography, props: { variant: "subtitle2", gutterBottom: true } },
                                p: { component: Typography, props: { variant: "body2", sx: { whiteSpace: "pre-wrap", mb: 0 } } },
                            },
                        }}
                    >
                        {comment.content}
                    </Markdown>
                    {showReply && (
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                multiline
                                minRows={2}
                                fullWidth
                                variant="outlined"
                                value={localReplyContent}
                                onChange={(e) => setLocalReplyContent(e.target.value)}
                                placeholder={`回复 @${comment.user?.username || "匿名"}`}
                                disabled={localReplySubmitting}
                                sx={{ mb: 1 }}
                            />
                            {localReplyError && (
                                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                    {localReplyError}
                                </Typography>
                            )}
                            <Box sx={{ textAlign: "right", mt: 1 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleLocalReplySubmit}
                                    disabled={localReplySubmitting || !localReplyContent.trim()}
                                >
                                    {localReplySubmitting ? "回复中..." : "回复"}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>
            {/* 递归渲染子评论 */}
            {comment.children.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    {comment.children.map((child) => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            depth={depth + 1}
                            onReply={onReply}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export function buildCommentTree(flatComments: IComment[]): Array<CommentTree> {
    const map = new Map<number, CommentTree>();
    const roots: Array<CommentTree> = [];
    flatComments.forEach((c) => {
        map.set(c.id, { ...c, children: [] });
    });
    map.forEach((comment) => {
        if (comment.parentId && map.has(comment.parentId)) {
            map.get(comment.parentId)!.children.push(comment);
        } else {
            roots.push(comment);
        }
    });
    return roots;
}

export default CommentItem;
