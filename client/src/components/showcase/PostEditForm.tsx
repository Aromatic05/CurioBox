import React from "react";
import { TextField, Box, Button, Alert } from "@mui/material";

interface PostEditFormProps {
    title: string;
    content: string;
    loading: boolean;
    error: string | null;
    onTitleChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

const PostEditForm: React.FC<PostEditFormProps> = ({
    title,
    content,
    loading,
    error,
    onTitleChange,
    onContentChange,
    onSave,
    onCancel,
}) => (
    <>
        <TextField
            label="标题"
            fullWidth
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            sx={{ mb: 2 }}
        />
        <TextField
            label="内容"
            fullWidth
            multiline
            minRows={5}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            sx={{ mb: 2 }}
        />
        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
            <Button
                variant="contained"
                color="primary"
                onClick={onSave}
                disabled={loading}
            >
                {loading ? "保存中..." : "保存"}
            </Button>
            <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
            >
                取消
            </Button>
        </Box>
    </>
);

export default PostEditForm;
