import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://stg-api.beldium.com";

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
