export interface IMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export const getPostsByTagId = (
    tagId: number,
    query?: Record<string, unknown>
): Promise<AxiosResponse<{ items: IPost[]; meta?: IMeta }>> => {
    // 直接复用 /showcase/posts，tagIds 参数为字符串
    return apiClient.get(`/showcase/posts`, {
        params: { tagIds: String(tagId), ...(query || {}), },
    });
};
// 新增：创建标签
export const createTag = (
    name: string,
    description?: string,
): Promise<AxiosResponse<ITag>> => {
    return apiClient.post("/showcase/tags", { name, description });
};
import apiClient from "./apiClient";
import type { AxiosResponse } from "axios";

// 1. 定义数据类型
export interface IPost {
    id: number;
    title: string;
    content: string;
    images: string[];
    tagIds: number[];
    tags?: ITag[];
    user: {
        id: number;
        username: string;
    };
    createdAt: string;
    updatedAt?: string;
    curioBoxId?: number;
    curioBox?: {
        id: number;
        name: string;
    };
    views: number;
    likes: number;
    commentCount: number;
    score?: number;
    hotScore?: number;
    lastActivityAt?: string;
}

export interface IComment {
    id: number;
    content: string;
    postId: number;
    parentId: number | null;
    user: {
        id: number;
        username: string;
    };
    createdAt: string;
}

// 新增：定义标签类型
export interface ITag {
    id: number;
    name: string;
    description: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type CreatePostPayload = {
    title: string;
    content: string;
    images: string[];
    tagIds: number[];
    curioBoxId?: number;
};

// 2. API 函数
export const getPosts = (
page: number = 1,
pageSize: number = 10,
sortBy: 'latest' | 'hot' | 'comprehensive' = 'latest',
): Promise<AxiosResponse<{ items: IPost[] }>> => {
    return apiClient.get("/showcase/posts", {
        params: { page, pageSize, sortBy },
    });
};

export const getPostById = (id: string): Promise<AxiosResponse<IPost>> => {
    return apiClient.get(`/showcase/posts/${id}`);
};

export const getCommentsByPostId = (
    id: string,
): Promise<AxiosResponse<IComment[]>> => {
    return apiClient.get(`/showcase/posts/${id}/comments`);
};

export const createPost = (
    data: CreatePostPayload,
): Promise<AxiosResponse<IPost>> => {
    return apiClient.post("/showcase/posts", data);
};

// 新增：获取某个盲盒下的帖子列表
export const getPostsByCurioBoxId = (
    curioBoxId: number,
    page: number = 1,
    pageSize: number = 10
): Promise<AxiosResponse<{ items: IPost[]; meta: IMeta }>> => {
    return apiClient.get(`/curio-boxes/${curioBoxId}/posts`, {
        params: { page, pageSize },
    });
};

// 新增：获取所有标签
export const getTags = (): Promise<AxiosResponse<ITag[]>> => {
    return apiClient.get("/showcase/tags");
};

export const getMyPosts = (): Promise<AxiosResponse<{ items: IPost[] }>> => {
    // 理想情况下，后端提供一个专门的接口
    return apiClient.get("/showcase/me/posts");
};

// 发表评论或回复
export type CreateCommentPayload = {
    content: string;
    postId: number;
    parentId?: number | null;
};

export const addCommentToPost = (
    postId: string | number,
    content: string,
    parentId?: number | null,
): Promise<AxiosResponse<IComment>> => {
    // 兼容 postId 为 string 或 number
    const payload: CreateCommentPayload = {
        content,
        postId: typeof postId === "string" ? parseInt(postId, 10) : postId,
        parentId: parentId ?? null,
    };
    return apiClient.post("/showcase/comments", payload);
};

// 回复评论（可选，实际与 addCommentToPost 相同，只是 parentId 不为 null）
export const replyComment = (
    postId: string | number,
    content: string,
    parentId: number,
): Promise<AxiosResponse<IComment>> => {
    return addCommentToPost(postId, content, parentId);
};

// 新增：更新帖子
export const updatePostById = (
    id: string | number,
    data: Partial<CreatePostPayload>,
): Promise<AxiosResponse<IPost>> => {
    return apiClient.put(`/showcase/posts/${id}`, data);
};

// 删除帖子
export const deletePostById = (
    id: string | number,
): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.delete(`/showcase/posts/${id}`);
};

// 删除评论
export const deleteCommentById = (
    id: string | number,
): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.delete(`/showcase/comments/${id}`);
};

// 点赞帖子
export const likePost = (
    postId: string | number
): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.post(`/showcase/posts/${postId}/like`);
};

// 取消点赞帖子
export const unlikePost = (
    postId: string | number
): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.delete(`/showcase/posts/${postId}/like`);
};

// 获取当前用户点赞过的帖子
export const getLikedPosts = (): Promise<AxiosResponse<IPost[]>> => {
    return apiClient.get('/showcase/me/liked-posts');
};

// 判断当前用户是否点赞了某帖子
export const isPostLiked = (
    postId: string | number
): Promise<AxiosResponse<{ liked: boolean }>> => {
    return apiClient.get(`/showcase/posts/${postId}/liked`);
};
