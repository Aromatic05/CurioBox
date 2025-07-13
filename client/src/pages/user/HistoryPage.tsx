import React, { useEffect, useState } from "react";
import { getMyBoxes, type IUserBox } from "../../api/orderApi";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
} from "@mui/material";

// 假设 RarityChip 组件在以下路径，如果不在，请修改路径
// 这个组件我们在实现详情页时已经创建
import RarityChip from "../../components/store/RarityChip";

const HistoryPage: React.FC = () => {
    const [openedBoxes, setOpenedBoxes] = useState<IUserBox[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                // 调用API获取已开启的盲盒
                const response = await getMyBoxes("OPENED");
                setOpenedBoxes(response.data.boxes);
            } catch (err) {
                setError("无法加载您的开箱记录，请稍后再试。");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                开箱记录
            </Typography>
            {openedBoxes.length === 0 ? (
                <Typography>您还没有开启过任何盲盒。</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="开箱记录表格">
                        <TableHead>
                            <TableRow>
                                <TableCell>获得物品</TableCell>
                                <TableCell align="left">来源盲盒</TableCell>
                                <TableCell align="center">稀有度</TableCell>
                                <TableCell align="right">获得日期</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {openedBoxes.map((box) => (
                                <TableRow
                                    key={box.id}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Avatar
                                                src={box.item?.image}
                                                sx={{ mr: 2 }}
                                                variant="rounded"
                                            />
                                            {box.item?.name || "未知物品"}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="left">
                                        {box.curioBox.name}
                                    </TableCell>
                                    <TableCell align="center">
                                        {box.item && (
                                            <RarityChip
                                                rarity={box.item.rarity}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {new Date(
                                            box.purchaseDate,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default HistoryPage;
