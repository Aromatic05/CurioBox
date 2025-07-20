import apiClient from "./apiClient";
import type { AxiosResponse } from "axios";

export interface IUser {
    id: number;
    username: string;
    role: string;
    avatar?: string;
    nickname?: string;
}

export const getUserById = (
    id: number | string,
): Promise<AxiosResponse<IUser>> => {
    console.log(`Fetching user with ID: ${id}`);
    return apiClient.get(`/auth/users/${id}`);
};
