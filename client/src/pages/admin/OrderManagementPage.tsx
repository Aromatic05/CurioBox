import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { getAllOrders } from '../../api/orderApi';

const OrderManagementPage: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getAllOrders()
            .then(res => setRows(res.data))
            .catch(() => setRows([]))
            .finally(() => setLoading(false));
    }, []);

    const columns: GridColDef[] = [
        { field: 'id', headerName: '订单ID', width: 100 },
        { field: 'userId', headerName: '用户ID', width: 100 },
        { field: 'curioBoxId', headerName: '盲盒ID', width: 100 },
        { field: 'price', headerName: '价格', type: 'number', width: 100 },
        { field: 'status', headerName: '状态', width: 120 },
        { field: 'createdAt', headerName: '创建时间', width: 180 },
        {
            field: 'curioBox',
            headerName: '盲盒名称',
            width: 180,
            valueGetter: (params: any) => params.row?.curioBox?.name || '',
        },
    ];

    return (
        <Box sx={{ height: '80vh', width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                订单管理
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                getRowId={row => row.id}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[5, 10, 20]}
            />
        </Box>
    );
};

export default OrderManagementPage;
