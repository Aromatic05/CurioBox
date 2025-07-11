import apiClient from './apiClient';
import type { AxiosResponse } from 'axios';

// 物品数据结构
export interface IItem {
    id: number;
    name: string;
    image: string;
    category: string;
    stock: number;
    rarity: string;
    curioBoxIds?: number[];
    curioBoxes?: Array<{
        id: number;
        name: string;
    }>;
    // 可根据API文档继续补充字段
}

// 获取所有物品
export const getItems = (): Promise<AxiosResponse<IItem[]>> => {
    return apiClient.get('/items');
};

// 获取单个物品详情
export const getItemById = (id: number): Promise<AxiosResponse<IItem>> => {
    return apiClient.get(`/items/${id}`);
};

// 创建物品（不带图片）
export const createItem = (data: Omit<IItem, 'id'>): Promise<AxiosResponse<IItem>> => {
    return apiClient.post('/items', data);
};

// 创建物品（带图片，multipart/form-data）
export const createItemWithImage = (formData: FormData): Promise<AxiosResponse<IItem>> => {
    return apiClient.post('/items/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// 更新物品
export const updateItem = (id: number, data: Partial<IItem>): Promise<AxiosResponse<IItem>> => {
    return apiClient.patch(`/items/${id}`, data);
};

// 删除物品
export const deleteItem = (id: number): Promise<AxiosResponse<void>> => {
    return apiClient.delete(`/items/${id}`);
};

// 修改物品库存
export const updateItemStock = (id: number, stock: number): Promise<AxiosResponse<IItem>> => {
    return apiClient.patch(`/items/${id}/stock`, { stock });
};

export const uploadItemImage = async (formData: FormData): Promise<AxiosResponse<{ url: string }>> => {
    const res = await apiClient.post('/items/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    // 自动补全 baseURL，避免重复斜杠
    let baseURL = apiClient.defaults.baseURL || '';
    if (baseURL.endsWith('/')) baseURL = baseURL.slice(0, -1);
    const url = res.data.url.startsWith('/') ? baseURL + res.data.url : res.data.url;
    return { ...res, data: { url } };
};