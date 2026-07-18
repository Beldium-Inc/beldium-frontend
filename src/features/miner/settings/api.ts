import { authApi } from "@/src/lib/axiosInstance";

export type MinerBankDetail = {
  id: string;
  bank_name: string | null;
  account_number: string | null; // masked, e.g. "****6789"
  account_name: string | null;
  verification_status: "unverified" | "verified" | "failed";
};

export type MinerProfile = {
  id: string;
  country: string | null;
  state_of_operation: string | null;
  local_government_area: string | null;
  business_role: string | null;
  miner_code: string | null;
  require_two_factor_authentication: boolean;
  notify_new_order_requests: boolean;
  notify_payment_updates: boolean;
  notify_compliance_reminders: boolean;
  preferred_contact_method: "email" | "phone";
  reminder_frequency: "weekly" | "monthly" | "quarterly";
  assigned_compliance_partner_name: string | null;
  bank_detail: MinerBankDetail | null;
};

export type UserProfile = {
  id: string;
  email: string;
  company_name: string;
  phone_number: string | null;
  profile_picture: string | null;
  account_verified: boolean;
  role: string;
  profile: MinerProfile | null;
};

export type GetUserResponse = {
  status: string;
  data: UserProfile;
  message: string | null;
};

export async function getUser() {
  const res = await authApi.get<GetUserResponse>("/user/get_user");
  return res.data;
}

export type UpdateUserPayload = Partial<{
  company_name: string;
  phone_number: string;
  profile_picture: string;
}>;

// NOTE: PATCH /user/{id} has no trailing slash. accounts/urls.py registers
// this router with trailing_slash=False, unlike most other endpoints.
export async function updateUser(id: string, payload: UpdateUserPayload) {
  const res = await authApi.patch(`/user/${id}`, payload);
  return res.data;
}

export type UpdateMinerProfilePayload = Partial<{
  state_of_operation: string;
  local_government_area: string;
  business_role: string;
  require_two_factor_authentication: boolean;
  notify_new_order_requests: boolean;
  notify_payment_updates: boolean;
  notify_compliance_reminders: boolean;
  preferred_contact_method: "email" | "phone";
  reminder_frequency: "weekly" | "monthly" | "quarterly";
}>;

export async function updateMinerProfile(profileId: string, payload: UpdateMinerProfilePayload) {
  const res = await authApi.patch(`/miner-profiles/${profileId}/`, payload);
  return res.data;
}

export type UpdateBankDetailPayload = Partial<{
  bank_name: string;
  account_number: string;
  account_name: string;
}>;

export async function updateBankDetail(profileId: string, payload: UpdateBankDetailPayload) {
  const res = await authApi.patch(`/miner-profiles/${profileId}/bank-detail/`, payload);
  return res.data;
}

export async function changePassword(payload: { old_password: string; new_password: string }) {
  const res = await authApi.post("/user/change_password", payload);
  return res.data;
}

export type LoginActivityEntry = {
  id: string;
  ip_address: string | null;
  device: string | null;
  location: string | null;
  created_at: string;
};

export type LoginActivityResponse = {
  status: string;
  data: LoginActivityEntry[];
  message: string | null;
};

export async function getLoginActivity() {
  const res = await authApi.get<LoginActivityResponse>("/user/login_activity");
  return res.data;
}
