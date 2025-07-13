import apiClient from "./apiClient";
import type { AxiosResponse } from "axios";

export interface IUser {
    id: number;
    username: string;
    role: string;
}

export const getUserById = (
    id: number | string,
): Promise<AxiosResponse<IUser>> => {
    console.log(`Fetching user with ID: ${id}`);
    return apiClient.get(`/users/${id}`);
};
