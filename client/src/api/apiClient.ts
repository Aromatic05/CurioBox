import axios from "axios";

// 1. 创建 Axios 实例
// 自动适配本地和局域网访问
const { protocol, hostname } = window.location;
const apiPort = 3000; // 后端端口
const baseURL = `${protocol}//${hostname}:${apiPort}/api`;

const apiClient = axios.create({
    baseURL,
    timeout: 10000, // 请求超时时间 10 秒
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. 设置请求拦截器 (为未来的认证功能做准备)
//    每次请求发送前，这个函数都会被调用
apiClient.interceptors.request.use(
    (config) => {
        // 在这里添加认证逻辑
        // 例如，从 localStorage 获取 token
        const token = localStorage.getItem("accessToken");

        // 如果 token 存在，则添加到请求头中
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    },
);

// 3. 导出实例
export default apiClient;

// 4. 响应拦截器：自动刷新 token
apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        // 401 且未重试过
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    // 用 refreshToken 请求新 accessToken
                    const res = await axios.post("/auth/refresh", { refreshToken }, {
                        baseURL: apiClient.defaults.baseURL,
                        headers: { "Content-Type": "application/json" },
                    });
                    localStorage.setItem("accessToken", res.data.accessToken);
                    localStorage.setItem("refreshToken", res.data.refreshToken);
                    // 更新请求头并重试原请求
                    originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                    return apiClient(originalRequest);
                } catch {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login";
                }
            } else {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
