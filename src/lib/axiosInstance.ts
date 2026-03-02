import axios from "axios";
const PROD_URL = process.env.NEXT_PUBLIC_API_URL_PROD || "https://api.beldium.com";
const STAGING_URL = process.env.NEXT_PUBLIC_API_URL_STAGING || "https://stg-api.beldium.com";
const USE_STAGING = (process.env.NEXT_PUBLIC_IS_TESTING || "").toLowerCase() === "true";
const BASE_URL = USE_STAGING ? STAGING_URL : PROD_URL;

// Public API (no token needed)
export const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});




// Auth API (requires token)
export const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

authApi.interceptors.request.use(
  (config) => {
    // Check for expiration
    const expiresAt = typeof window !== "undefined" ? sessionStorage.getItem("tokenExpiration") : null;
    if (expiresAt && Date.now() > Number(expiresAt)) {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Token expired"));
    }

    const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
