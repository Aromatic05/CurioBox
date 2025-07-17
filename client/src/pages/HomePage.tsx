import { Container, Box, Typography } from "@mui/material";

function HomePage() {
    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                    欢迎来到盲盒商店！
                </Typography>
            </Box>
        </Container>
    );
}
export default HomePage;
