import React from "react";
import { Box, Typography } from "@mui/material";

interface Tag {
    id: number;
    name: string;
    description?: string;
}

interface TagListProps {
    tags: Tag[];
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
    if (!tags || tags.length === 0) {
        return (
            <Typography variant="body2" color="error">
                暂无标签
            </Typography>
        );
    }
    return (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {tags.map((tag) => (
                <Box
                    key={tag.id}
                    sx={{
                        px: 1.5,
                        py: 0.5,
                        bgcolor: "#e0f7fa",
                        borderRadius: 1,
                        fontSize: 14,
                        color: "#00796b",
                        fontWeight: 500,
                    }}
                >
                    {tag.name}
                    {/* {tag.description && (
                        <span style={{ color: '#888', marginLeft: 4, fontSize: 12 }}>
                            ({tag.description})
                        </span>
                    )} */}
                </Box>
            ))}
        </Box>
    );
};

export default TagList;
