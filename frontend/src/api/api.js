import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

// ============================================
// ATTACH ACCESS TOKEN
// ============================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // IMPORTANT:
        // Don't force application/json for FormData.
        // Axios/browser will automatically set multipart/form-data
        // with the required boundary.
        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        } else {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// ============================================
// REFRESH TOKEN QUEUE
// ============================================

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


// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // ========================================
        // HANDLE NON-401 ERRORS
        // ========================================

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


        // ========================================
        // DON'T REFRESH REFRESH-ENDPOINT
        // ========================================

        if (
            originalRequest.url?.includes(
                "/auth/refresh"
            )
        ) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            return Promise.reject(error);
        }


        originalRequest._retry = true;

        const refreshToken =
            localStorage.getItem("refreshToken");


        // ========================================
        // NO REFRESH TOKEN
        // ========================================

        if (!refreshToken) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            return Promise.reject(error);
        }


        // ========================================
        // WAIT IF TOKEN REFRESH IS ALREADY RUNNING
        // ========================================

        if (isRefreshing) {
            return new Promise(
                (resolve, reject) => {
                    failedQueue.push({
                        resolve,
                        reject,
                    });
                }
            )
                .then((newAccessToken) => {
                    originalRequest.headers.Authorization =
                        `Bearer ${newAccessToken}`;

                    return api(originalRequest);
                })
                .catch((refreshError) =>
                    Promise.reject(refreshError)
                );
        }


        // ========================================
        // START TOKEN REFRESH
        // ========================================

        isRefreshing = true;

        try {
            const response = await axios.post(
                `${API_URL}/auth/refresh`,
                {
                    refreshToken,
                },
                {
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
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


            // ========================================
            // SAVE NEW TOKENS
            // ========================================

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


            // ========================================
            // RESOLVE WAITING REQUESTS
            // ========================================

            processQueue(
                null,
                newAccessToken
            );


            // ========================================
            // RETRY ORIGINAL REQUEST
            // ========================================

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);

        } catch (refreshError) {

            processQueue(
                refreshError,
                null
            );

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "refreshToken"
            );

            localStorage.removeItem(
                "user"
            );

            console.error(
                "Refresh token failed:",
                refreshError.response?.data ||
                    refreshError.message
            );

            return Promise.reject(
                refreshError
            );

        } finally {
            isRefreshing = false;
        }
    }
);


export default api;