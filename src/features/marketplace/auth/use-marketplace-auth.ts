"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMarketplaceUser } from "./marketplace-auth-api";

// Marketplace auth reuses the same sessionStorage token keys as the miner
// Login.tsx (accessToken / tokenExpiration) - see marketplace-auth-api.ts
// header comment for why this is safe (same /user/login endpoint, same JWT).
export function hasMarketplaceSession() {
  if (typeof window === "undefined") return false;
  const token = sessionStorage.getItem("accessToken");
  const expiry = Number(sessionStorage.getItem("tokenExpiration") ?? 0);
  return Boolean(token) && Date.now() < expiry;
}

export function useMarketplaceAuth() {
  // `checked` distinguishes "haven't looked at sessionStorage yet" (SSR/
  // first paint) from "looked, and there's no session" - without it, a
  // logged-in user briefly reads as unauthenticated on mount, which is
  // enough for RequireMarketplaceAuth's redirect effect to fire wrongly.
  const [checked, setChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(hasMarketplaceSession());
    setChecked(true);
  }, []);

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ["marketplace", "current-user"],
    queryFn: getMarketplaceUser,
    enabled: checked && hasSession,
    retry: false,
  });

  const user = data?.data;
  // Same sessionStorage token keys as the miner portal and compliance
  // dashboard (see comment above) - a signed-in Miner or Compliance account
  // can carry a perfectly valid token in here just by navigating to
  // /marketplace/*, so this has to check role, not just "is there a user".
  const isBuyer = user?.role === "Buyer";
  const isLoading = !checked || (hasSession && queryLoading);

  return {
    isAuthenticated: checked && hasSession && isBuyer,
    isLoading,
    user,
  };
}

export function logoutMarketplaceUser() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("tokenExpiration");
}
