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

import RarityChip from "../../components/store/RarityChip";
import { TablePagination } from "@mui/material";

const HistoryPage: React.FC = () => {
    const [openedBoxes, setOpenedBoxes] = useState<IUserBox[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 分页相关状态
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    // 计算当前页数据
    const paginatedBoxes = openedBoxes.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
    );

    // 分页控件事件
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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
                            {paginatedBoxes.map((box) => (
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
                    {/* 分页控件 */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <TablePagination
                            component="div"
                            count={openedBoxes.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            labelRowsPerPage="每页条数"
                        />
                    </Box>
                </TableContainer>
            )}
        </Box>
    );
};

export default HistoryPage;
