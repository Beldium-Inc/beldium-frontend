import axios from "axios";

const STAGING_BASE_URL = "https://stg-api.beldium.com";
const PRODUCTION_BASE_URL = "https://api-beldium-backend.onrender.com";
const DEV_PROXY_BASE_URL = "/api";

const getBaseUrl = () => {
  const useDevProxy =
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true" ||
    process.env.NODE_ENV === "development";

  if (useDevProxy) {
    return DEV_PROXY_BASE_URL;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  switch (process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase()) {
    case "production":
    case "prod":
      return PRODUCTION_BASE_URL;
    case "staging":
    case "stage":
    default:
      return STAGING_BASE_URL;
  }
};

const BASE_URL = getBaseUrl();

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
