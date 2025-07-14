import apiClient from "./apiClient";

// 查询当前用户所有 item
export async function getUserItems() {
    const res = await apiClient.get("/me/items");
    return res.data.items;
}

// 删除/减少指定 item
export async function removeUserItem(itemId: number, count: number = 1) {
    const res = await apiClient.delete(`/me/items/${itemId}`, {
        params: { count },
    });
    return res.data;
}
