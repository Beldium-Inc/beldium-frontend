"use client";

import { AxiosError } from "axios";
import { authApi } from "./axiosInstance";

// Attach the current access token to every authenticated request. Actual
// expiry is enforced server-side; a 401 below is what triggers a refresh,
// not a client-side clock, so a stale local clock can't log a user out from
// under them mid-session.
authApi.interceptors.request.use(
  (config) => {
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

        // POST /user/refresh_token, not /auth/refresh (that route doesn't
        // exist on the backend). Requires the current (soon-to-expire)
        // access token on the Authorization header, hence authApi.
        const { data } = await authApi.post("/user/refresh_token", {
          refresh_token: refreshToken,
        });
        const newAccessToken = data?.data?.access;
        if (!newAccessToken) {
          throw new Error("Refresh response missing access token");
        }

        sessionStorage.setItem("accessToken", newAccessToken);
        // The backend doesn't rotate the refresh token on this endpoint, so
        // the existing one stays valid until it expires or is blacklisted.
        const expiresAt = Date.now() + 3600 * 1000;
        sessionStorage.setItem("tokenExpiration", String(expiresAt));

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
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