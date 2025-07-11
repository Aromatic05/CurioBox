import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { getItems, deleteItem } from '../../api/itemApi';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ItemManagementPage: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await getItems();
            setRows(response.data);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('您确定要删除这个物品吗?')) {
            try {
                await deleteItem(id);
                fetchItems();
            } catch (error) {
                console.error('Failed to delete item:', error);
            }
        }
    };

    const handleAdd = () => {
        window.location.href = '/admin/item/edit';
    };
    const handleEdit = (id: number) => {
        window.location.href = `/admin/item/edit/${id}`;
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: '物品名称', width: 200 },
        { field: 'category', headerName: '分类', width: 150 },
        { field: 'rarity', headerName: '稀有度', width: 120 },
        { field: 'stock', headerName: '库存', type: 'number', width: 110 },
        {
            field: 'image',
            headerName: '图片',
            width: 120,
            renderCell: (params) => (
                params.value ? (
                    <img src={params.value} alt="物品图片" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
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
                物品管理
            </Typography>
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>
                新增物品
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
                sx={{
                    '& .MuiDataGrid-row': {
                        minHeight: 80,
                        maxHeight: 120,
                    },
                    '& .MuiDataGrid-cell': {
                        alignItems: 'center',
                    },
                }}
            />
        </Box>
    );
};

export default ItemManagementPage;
