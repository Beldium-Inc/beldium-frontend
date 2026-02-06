import { publicApi, authApi } from "@/src/lib/axiosInstance";

export type SignupPayload = {
  email: string;
  password: string;
  company_name: string;
  phone_number: string;
  device_token: string;
  device_type: "web";
  role: "Miner" | "Compliance";
};

export async function signup(payload: SignupPayload) {
  const { data } = await publicApi.post("/user/signup", payload);
  return data;
}

export type VerifyPayload = {
  email: string;
  verification_code: string;
};

export async function verifyAccount(payload: VerifyPayload) {
  const { data } = await publicApi.post("/user/account_verification", payload);
  return data;
}

export type ResendPayload = {
  email: string;
};

export async function resendOtp(payload: ResendPayload) {
  const { data } = await publicApi.post("/user/resend_otp", payload);
  return data;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const { data } = await publicApi.post("/user/login", payload);
  return data;
}

export async function getUser() {
  const { data } = await authApi.get("/user/get_user");
  return data;
}
