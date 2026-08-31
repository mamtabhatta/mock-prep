
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Prevent multiple refresh requests at the same time
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

// Handle expired access token
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 once per request
        if (
            error.response?.status !== 401 ||
            originalRequest?._retry
        ) {
            console.error(
                "API Error:",
                error.response?.status,
                error.response?.data || error.message
            );

            return Promise.reject(error);
        }

        // Don't try to refresh the refresh endpoint itself
        if (originalRequest.url?.includes("/auth/refresh")) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const refreshToken =
            localStorage.getItem("refreshToken");

        if (!refreshToken) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            return Promise.reject(error);
        }

        // If another request is already refreshing,
        // wait for that request to finish.
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve,
                    reject,
                });
            })
                .then((newAccessToken) => {
                    originalRequest.headers.Authorization =
                        `Bearer ${newAccessToken}`;

                    return api(originalRequest);
                })
                .catch((refreshError) => {
                    return Promise.reject(refreshError);
                });
        }

        isRefreshing = true;

        try {
            const response = await axios.post(
                `${API_URL}/auth/refresh`,
                {
                    refreshToken,
                }
            );

            const newAccessToken =
                response.data?.data?.accessToken;

            const newRefreshToken =
                response.data?.data?.refreshToken;

            if (!newAccessToken) {
                throw new Error(
                    "New access token was not returned."
                );
            }

            // Save new tokens
            localStorage.setItem(
                "accessToken",
                newAccessToken
            );

            if (newRefreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    newRefreshToken
                );
            }

            // Resolve requests that were waiting
            processQueue(null, newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);

            // Refresh token is also invalid/expired
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            console.error(
                "Refresh token failed:",
                refreshError.response?.data ||
                    refreshError.message
            );

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;

