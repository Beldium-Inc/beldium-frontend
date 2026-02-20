import { AxiosError } from "axios";
import { authApi, publicApi } from "./axiosInstance";

authApi.interceptors.request.use(
  (config) => {
    // Check for expiration
    const expiresAt = sessionStorage.getItem("tokenExpiration");
    if (expiresAt && Date.now() > Number(expiresAt)) {
      sessionStorage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Token expired"));
    }

    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any; // Cast to any to access _retry property

    if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (!refreshToken) {
          // Clear session and redirect if no refresh token
          sessionStorage.clear();
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
             window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        const { data } = await publicApi.post("/auth/refresh", {
          token: refreshToken,
        });

        sessionStorage.setItem("accessToken", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);
        // Reset expiration on refresh
        const expiresAt = Date.now() + 3600 * 1000;
        sessionStorage.setItem("tokenExpiration", String(expiresAt));

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        sessionStorage.clear();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);