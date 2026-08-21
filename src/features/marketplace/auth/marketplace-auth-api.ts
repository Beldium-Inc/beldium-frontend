import { publicApi, authApi } from "@/src/lib/axiosInstance";

/**
 * Reuses the SAME endpoints as the miner onboarding flow
 * (features/onboarding/api.ts: /user/signup, /user/login,
 * /user/account_verification, /user/resend_otp, /user/get_user) - not
 * duplicated backend routes. Confirmed against accounts/views.py +
 * SignupSerializer (accounts/serializers.py:294): `role` is a plain
 * ChoiceField over the full Roles enum (accounts/choices.py), defaulting to
 * MINER - it already accepts role="Buyer" today with no backend change.
 *
 * What IS still missing on the backend, so it's called out here rather than
 * silently faked:
 *  - "OEM" and "Off-taker" are NOT entries in accounts/choices.py Roles.
 *    Until a backend decision is made (new Roles values, or a
 *    `business_role` distinction under Roles.BUYER), this file submits both
 *    as role="Buyer" and additionally sends `business_role` with the raw
 *    selection ("OEM" / "Off-taker") for forward-compatibility - but
 *    SignupSerializer does not currently read that field, so it is silently
 *    dropped by DRF today. User.company table does have a `business_role`
 *    column already (accounts/models.py:161); it just isn't wired into
 *    SignupSerializer's validated_data yet.
 *  - Google OAuth ("Continue with google") has no provider configured in
 *    core/settings.py - getGoogleOAuthUrl() below points at a route that
 *    does not exist yet.
 */

// Miner is deliberately not a marketplace signup role - miners onboard
// through the main app (app.beldium.com), not the public marketplace.
export type MarketplaceRole = "buyer" | "oem" | "off_taker";

const ROLE_TO_BACKEND_ROLE: Record<MarketplaceRole, "Buyer"> = {
  buyer: "Buyer",
  oem: "Buyer", // no OEM role on the backend yet - see file header
  off_taker: "Buyer", // no Off-taker role on the backend yet - see file header
};

const ROLE_TO_BUSINESS_ROLE_LABEL: Record<MarketplaceRole, string> = {
  buyer: "Buyer",
  oem: "OEM",
  off_taker: "Off-taker",
};

export type MarketplaceRegisterPersonalInfo = {
  full_name: string;
  state: string;
  business_address: string;
  company_name: string;
};

export type MarketplaceRegisterPayload = MarketplaceRegisterPersonalInfo & {
  // A buyer can pick up to 2 roles (e.g. Buyer + OEM). The backend only has
  // a single `role` field, so the first pick drives that, and the full
  // combination is passed as `business_role` (see file header - not yet
  // persisted, since SignupSerializer doesn't read that field today).
  roles: MarketplaceRole[];
  email: string;
  password: string;
};

export async function registerMarketplaceUser(payload: MarketplaceRegisterPayload) {
  const primaryRole = payload.roles[0];
  const { data } = await publicApi.post("/user/signup", {
    email: payload.email,
    password: payload.password,
    company_name: payload.company_name || payload.full_name,
    role: ROLE_TO_BACKEND_ROLE[primaryRole],
    business_role: payload.roles.map((r) => ROLE_TO_BUSINESS_ROLE_LABEL[r]).join(", "), // see file header: not yet persisted
    full_name: payload.full_name,
    state: payload.state,
    business_address: payload.business_address,
    device_type: "web",
  });
  return data;
}

export async function verifyMarketplaceOtp(email: string, code: string) {
  const { data } = await publicApi.post("/user/account_verification", {
    email,
    verification_code: code,
  });
  return data;
}

export async function resendMarketplaceOtp(email: string) {
  const { data } = await publicApi.post("/user/resend_otp", { email });
  return data;
}

export async function loginMarketplaceUser(email: string, password: string) {
  const { data } = await publicApi.post("/user/login", { email, password });
  return data;
}

export async function getMarketplaceUser() {
  const { data } = await authApi.get("/user/get_user");
  return data;
}

// NEEDED: no google_oauth2 provider is configured in core/settings.py yet.
export function getGoogleOAuthUrl() {
  return "/accounts/marketplace/google/redirect/";
}
