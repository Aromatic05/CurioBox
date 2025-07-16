import React, { useEffect, useState } from "react";
import { getCurioBoxes, type ICurioBox } from "../../api/curioBoxApi";
import { searchCurioBoxes } from "../../api/curioBoxApi";
import CurioBoxCard from "../../components/store/CurioBoxCard";
import { Container, Typography, Box, Alert, Skeleton } from "@mui/material";
import { TextField, InputAdornment, IconButton, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const StorePage: React.FC = () => {
    const [boxes, setBoxes] = useState<ICurioBox[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                setLoading(true);
                const response = await getCurioBoxes();
                setBoxes(response.data);
            } catch (err) {
                setError("无法加载盲盒列表，请稍后再试。");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBoxes();
    }, []);

    // 搜索事件
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!search.trim()) {
            // 空搜索恢复全部
            setSearching(true);
            try {
                const response = await getCurioBoxes();
                setBoxes(response.data);
            } catch (err) {
                console.log(err);
                setError("无法加载盲盒列表，请稍后再试。");
            } finally {
                setSearching(false);
            }
            return;
        }
        setSearching(true);
        try {
            const response = await searchCurioBoxes(search.trim());
            setBoxes(response.data);
        } catch (err) {
            console.log(err);
            setError("搜索失败，请稍后再试。");
        } finally {
            setSearching(false);
        }
    };

    const renderSkeletons = () => (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                justifyContent: "center",
            }}
        >
            {Array.from(new Array(8)).map((_, index) => (
                <Box
                    key={index}
                    sx={{
                        width: { xs: "100%", sm: "48%", md: "31%", lg: "23%" },
                        mb: 4,
                    }}
                >
                    <Skeleton variant="rectangular" height={200} />
                    <Skeleton />
                    <Skeleton width="60%" />
                </Box>
            ))}
        </Box>
    );

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
            }}
        >
            <Typography variant="h3" component="h1" gutterBottom align="center">
                探索所有盲盒
            </Typography>

            {/* 搜索框 */}
            <Box component="form" onSubmit={handleSearch} sx={{ width: "100%", maxWidth: 500, mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="搜索盲盒名称/分类/描述"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton type="submit" disabled={searching}>
                                        {searching ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                                                <CircularProgress size={20} />
                                            </Box>
                                        ) : (
                                            <SearchIcon />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    variant="outlined"
                />
            </Box>

            {loading ? (
                renderSkeletons()
            ) : error ? (
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            ) : (
                boxes.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 4 }}>
                        未找到相关盲盒，请尝试其他关键词。
                    </Alert>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                            justifyContent: "center",
                            width: "100%",
                        }}
                    >
                        {boxes.map((box) => (
                            <Box
                                key={box.id}
                                sx={{
                                    width: {
                                        xs: "100%",
                                        sm: "48%",
                                        md: "31%",
                                        lg: "23%",
                                    },
                                    mb: 4,
                                }}
                            >
                                <CurioBoxCard box={box} />
                            </Box>
                        ))}
                    </Box>
                )
            )}
        </Container>
    );
};

export default StorePage;
