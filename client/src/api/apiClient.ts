import axios from 'axios';

// 1. 创建 Axios 实例
const apiClient = axios.create({
    // 请将 'http://localhost:3000/api' 替换为你的实际后端API地址
    baseURL: 'http://localhost:3000/api',
    timeout: 10000, // 请求超时时间 10 秒
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. 设置请求拦截器 (为未来的认证功能做准备)
//    每次请求发送前，这个函数都会被调用
apiClient.interceptors.request.use(
    (config) => {
        // 在这里添加认证逻辑
        // 例如，从 localStorage 获取 token
        const token = localStorage.getItem('accessToken');

        // 如果 token 存在，则添加到请求头中
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 3. 导出实例
export default apiClient;