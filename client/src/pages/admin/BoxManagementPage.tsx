// src/pages/admin/BoxManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { DataGrid, } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { getCurioBoxes, deleteCurioBox } from '../../api/curioBoxApi';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const BoxManagementPage: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(false);

    const fetchBoxes = async () => {
        setLoading(true);
        try {
            const response = await getCurioBoxes();
            setRows(response.data);
        } catch (error) {
            console.error("Failed to fetch curio boxes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoxes();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('您确定要删除这个盲盒吗?')) {
            try {
                await deleteCurioBox(id);
                // 刷新列表
                fetchBoxes();
            } catch (error) {
                console.error('Failed to delete curio box:', error);
            }
        }
    };

    // 新增和编辑跳转逻辑
    const handleAdd = () => {
        window.location.href = '/admin/box/edit';
    };
    const handleEdit = (id: number) => {
        window.location.href = `/admin/box/edit/${id}`;
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: '盲盒名称', width: 200 },
        { field: 'category', headerName: '分类', width: 150 },
        { field: 'price', headerName: '价格', type: 'number', width: 110 },
        { field: 'description', headerName: '描述', flex: 1 },
        {
            field: 'image',
            headerName: '图片',
            width: 120,
            renderCell: (params) => (
                params.value ? (
                    <img src={params.value} alt="盲盒图片" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                    <span style={{ color: '#aaa' }}>无图片</span>
                )
            ),
        },
        {
            field: 'actions',
            headerName: '操作',
            sortable: false,
            width: 150,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row.id)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id as number)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Box sx={{ height: '80vh', width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                盲盒管理
            </Typography>
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
                新增盲盒
            </Button>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
            />
        </Box>
    );
};

export default BoxManagementPage;