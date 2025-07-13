import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

function NotFoundPage() {
    return (
        <Box
            sx={{
                textAlign: "center",
                py: 10,
                bgcolor: "#f8f8fa",
                minHeight: "60vh",
            }}
        >
            <Typography
                variant="h1"
                color="error"
                fontWeight={700}
                gutterBottom
            >
                404
            </Typography>
            <Typography variant="h5" sx={{ mb: 3 }}>
                页面未找到
            </Typography>
            <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/"
            >
                返回首页
            </Button>
        </Box>
    );
}
export default NotFoundPage;
