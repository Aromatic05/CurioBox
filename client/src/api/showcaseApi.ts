import apiClient from './apiClient';
import type { AxiosResponse } from 'axios';

// 1. 定义数据类型
export interface IPost {
  id: number;
  title: string;
  content: string;
  images: string[];
  tagIds: number[];
  // 假设API会返回作者信息
  author?: {
    username: string;
  };
  createdAt: string; 
}

export interface IComment {
  id: number;
  content: string;
  postId: number;
  parentId: number | null;
  author: {
    username: string;
  };
  createdAt: string;
}

// 新增：定义标签类型
export interface ITag {
  id: number;
  name: string;
  description: string;
}

export type CreatePostPayload = Omit<IPost, 'id' | 'author' | 'createdAt'>;

// 2. API 函数
export const getPosts = (page: number = 1, pageSize: number = 10): Promise<AxiosResponse<{ items: IPost[] }>> => {
  return apiClient.get('/showcase/posts', { params: { page, pageSize, sortBy: 'latest' } });
};

export const getPostById = (id: string): Promise<AxiosResponse<IPost>> => {
  return apiClient.get(`/showcase/posts/${id}`);
};

export const getCommentsByPostId = (id: string): Promise<AxiosResponse<IComment[]>> => {
  return apiClient.get(`/showcase/posts/${id}/comments`);
};

export const createPost = (data: CreatePostPayload): Promise<AxiosResponse<IPost>> => {
  return apiClient.post('/showcase/posts', data);
};

// 新增：获取所有标签
export const getTags = (): Promise<AxiosResponse<ITag[]>> => {
  return apiClient.get('/showcase/tags');
};