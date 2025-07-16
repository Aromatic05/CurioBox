import apiClient from "./apiClient";
import type { AxiosResponse } from "axios";
import type { ICurioBox } from "./curioBoxApi";
import type { IItem } from "./itemApi";

interface PurchasePayload {
    curioBoxId: number;
    quantity: number;
}

// 定义用户仓库中盲盒的类型
export interface IUserBox {
    id: number;
    status: "unopened" | "opened";
    purchaseDate: string;
    curioBox: ICurioBox;
    item?: IItem; // 如果已开启，则包含物品信息
}

// 定义开箱请求和响应类型
export interface OpenBoxPayload {
    userBoxId: number;
}
export interface OpenBoxResponse {
    results: {
        userBoxId: number;
        drawnItem: IItem;
        success: boolean;
    }[];
}

// 假设的购买成功响应类型
interface PurchaseResponse {
    message: string;
    order: object;
    userBoxes: object[];
}

export const purchaseCurioBox = (
    data: PurchasePayload,
): Promise<AxiosResponse<PurchaseResponse>> => {
    return apiClient.post("/orders/purchase", data);
};

// 获取个人盲盒仓库
export const getMyBoxes = (
    status: "UNOPENED" | "OPENED" | "ALL" = "UNOPENED",
): Promise<AxiosResponse<{ boxes: IUserBox[] }>> => {
    return apiClient.get("/me/boxes", { params: { status } });
};

// 开启盲盒
export const openBox = (
    data: OpenBoxPayload,
): Promise<AxiosResponse<OpenBoxResponse>> => {
    return apiClient.post("/me/boxes/open", data);
};

// 定义订单类型（与后端 Order 实体保持一致）
export interface IOrder {
    id: number;
    price: string;
    status: "completed" | "pending" | "cancelled";
    createdAt: string;
    userId: number;
    curioBoxId: number;
    drawnItemId?: number | null;
}

// 获取所有订单（仅管理员）
export const getAllOrders = (): Promise<AxiosResponse<IOrder[]>> => {
    return apiClient.get("/orders/all");
};

// 假设有获取订单历史的API
// export const getMyOrders = (): Promise<AxiosResponse<any[]>> => {
//   return apiClient.get('/orders');
// };
