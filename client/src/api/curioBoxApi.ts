// src/api/curioBoxApi.ts
import apiClient from "./apiClient";
import type { AxiosResponse } from "axios";

// 定义盲盒的数据结构
export interface ICurioBox {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    coverImage?: string; // 封面图片URL，可选
    items?: Array<{
        id: number;
        name: string;
        image: string;
        rarity: string;
        // ...其他物品字段
    }>;
    itemProbabilities?: Array<{
        itemId: number;
        probability: number;
    }>;
    boxCount: number; // 盲盒数量
    // 其他API文档中出现的字段可继续补充
}

// 获取所有盲盒
export const getCurioBoxes = (): Promise<AxiosResponse<ICurioBox[]>> => {
    return apiClient.get("/curio-boxes");
};

// 创建盲盒的请求体类型 (不包含id)
export type CreateCurioBoxPayload = Omit<ICurioBox, "id">;

// 创建一个新盲盒
export const createCurioBox = (
    data: CreateCurioBoxPayload,
): Promise<AxiosResponse<ICurioBox>> => {
    return apiClient.post("/curio-boxes", data);
};

// 删除一个盲盒
export const deleteCurioBox = (id: number): Promise<AxiosResponse<void>> => {
    return apiClient.delete(`/curio-boxes/${id}`);
};

// 获取单个盲盒详情
export const getCurioBoxById = (
    id: number,
): Promise<AxiosResponse<ICurioBox>> => {
    return apiClient.get(`/curio-boxes/${id}`);
};

// 更新盲盒
export const updateCurioBox = (
    id: number,
    data: Partial<ICurioBox>,
): Promise<AxiosResponse<ICurioBox>> => {
    return apiClient.patch(`/curio-boxes/${id}`, data);
};

// 专门修改盲盒数量
export const updateCurioBoxCount = (
    id: number,
    boxCount: number,
): Promise<AxiosResponse<ICurioBox>> => {
    return apiClient.patch(`/curio-boxes/${id}/box-count`, { boxCount });
};

// 批量更新盲盒物品及概率
export const updateCurioBoxItemsAndProbabilities = (
    id: number,
    payload: {
        itemIds?: number[];
        itemProbabilities?: { itemId: number; probability: number }[];
    },
): Promise<AxiosResponse<ICurioBox>> => {
    return apiClient.patch(
        `/curio-boxes/${id}/items-and-probabilities`,
        payload,
    );
};

// 搜索盲盒
export const searchCurioBoxes = (
    q: string,
): Promise<AxiosResponse<ICurioBox[]>> => {
    return apiClient.get(`/curio-boxes/search?q=${encodeURIComponent(q)}`);
};

// 创建带图片的盲盒（multipart/form-data）
export const createCurioBoxWithCover = (
    formData: FormData,
): Promise<AxiosResponse<ICurioBox>> => {
    return apiClient.post("/curio-boxes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// 上传盲盒图片（返回完整图片URL，自动补全 baseURL）
export const uploadCurioBoxImage = async (
    formData: FormData,
): Promise<AxiosResponse<{ url: string }>> => {
    const res = await apiClient.post("/curio-boxes/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    // 自动补全 baseURL，避免重复斜杠
    let baseURL = apiClient.defaults.baseURL || "";
    baseURL = baseURL.replace(/\/api$/, "");
    if (baseURL.endsWith("/")) baseURL = baseURL.slice(0, -1);
    const url = res.data.url.startsWith("/")
        ? baseURL + res.data.url
        : res.data.url;
    return { ...res, data: { url } };
};
