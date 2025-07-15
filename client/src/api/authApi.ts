import apiClient from "./apiClient";
import type { AxiosResponse } from "axios";

// 1. 定义接口请求和响应的类型
interface LoginPayload {
    username: string;
    password: string;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

// 这里的 IUser 应该与 AuthContext 中定义的一致
interface IUser {
    id: number;
    username: string;
    role: string;
    avatar?: string; // 用户头像 URL，可选
}

// 我们假设登录成功后，除了token，还需要一个接口来获取用户信息
export const fetchUserData = (): Promise<AxiosResponse<IUser>> => {
    // 假设有一个 /auth/me 的接口根据token返回用户信息
    return apiClient.get("/auth/me");
};

export const loginUser = (
    data: LoginPayload,
): Promise<AxiosResponse<LoginResponse>> => {
    return apiClient.post("/auth/login", data);
};

// 注册用户（前端强制 role 为 'user'，防止注册管理员）
export const registerUser = (data: {
    username: string;
    password: string;
    role?: string;
}): Promise<AxiosResponse<IUser>> => {
    const safeData = { ...data, role: "user" };
    return apiClient.post("/auth/register", safeData);
};

// 修改密码
export const changePassword = (data: {
    oldPassword: string;
    newPassword: string;
}): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.post("/auth/change-password", data);
};

// 设置昵称
export const setNickname = (
    nickname: string,
): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.post("/auth/set-nickname", { nickname });
};

// 退出登录
export const logout = (): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.get("/auth/logout");
};

// 上传用户头像
export const uploadAvatar = async (
    formData: FormData,
): Promise<AxiosResponse<{ url: string }>> => {
    const res = await apiClient.post("/auth/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    let baseURL = apiClient.defaults.baseURL || "";
    if (baseURL.endsWith("/")) baseURL = baseURL.slice(0, -1);
    const url = res.data.url.startsWith("/")
        ? baseURL + res.data.url
        : res.data.url;
    return { ...res, data: { url } };
};

// 删除用户（仅本人或管理员）
// 删除用户（仅本人或管理员，支持传递 userId）
export const deleteUser = (userId?: number): Promise<AxiosResponse<{ message: string }>> => {
    if (userId) {
        console.log("deleteUser 请求体:", { userId });
        return apiClient.post("/auth/delete-user", { userId });
    }
    console.log("deleteUser 请求体: 空");
    return apiClient.post("/auth/delete-user");
};
