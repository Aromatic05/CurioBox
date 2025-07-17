import React from "react";
import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface CurioBoxLinkProps {
    curioBoxId: number;
    curioBoxName?: string | null;
}

const CurioBoxLink: React.FC<CurioBoxLinkProps> = ({ curioBoxId, curioBoxName }) => {
    const navigate = useNavigate();
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="primary">
                盲盒：
                <span
                    style={{ textDecoration: "underline", color: "#1976d2", cursor: "pointer" }}
                    onClick={() => navigate(`/box/${curioBoxId}`)}
                >
                    {curioBoxName || `ID: ${curioBoxId}`}
                </span>
            </Typography>
        </Box>
    );
};

export default CurioBoxLink;
