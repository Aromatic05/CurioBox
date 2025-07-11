// src/api/curioBoxApi.ts
import apiClient from './apiClient';
import type { AxiosResponse } from 'axios';

// 定义盲盒的数据结构
export interface ICurioBox {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  // ... 其他根据API文档的字段
}

// 获取所有盲盒
export const getCurioBoxes = (): Promise<AxiosResponse<ICurioBox[]>> => {
  return apiClient.get('/curio-boxes');
};

// 创建盲盒的请求体类型 (不包含id)
export type CreateCurioBoxPayload = Omit<ICurioBox, 'id'>;

// 创建一个新盲盒
export const createCurioBox = (data: CreateCurioBoxPayload): Promise<AxiosResponse<ICurioBox>> => {
  return apiClient.post('/curio-boxes', data);
}

// 删除一个盲盒
export const deleteCurioBox = (id: number): Promise<AxiosResponse<void>> => {
  return apiClient.delete(`/curio-boxes/${id}`);
}

// ...后续可以添加 updateCurioBox 函数