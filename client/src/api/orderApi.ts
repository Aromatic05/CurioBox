import apiClient from './apiClient';
import type { AxiosResponse } from 'axios';

interface PurchasePayload {
  curioBoxId: number;
  quantity: number;
}

// 假设的购买成功响应类型
interface PurchaseResponse {
  message: string;
  order: object;
  userBoxes: object[];
}

export const purchaseCurioBox = (data: PurchasePayload): Promise<AxiosResponse<PurchaseResponse>> => {
  return apiClient.post('/orders/purchase', data);
};