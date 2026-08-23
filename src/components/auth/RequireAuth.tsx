"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/src/features/onboarding/api";

function hasValidSession(): boolean {
  // Only gate on token presence. Actual expiry is enforced server-side and
  // handled by the axios 401 -> refresh flow, so this doesn't boot users to
  // /login on a stale client clock while their session is still good.
  return Boolean(sessionStorage.getItem("accessToken"));
}

/**
 * Blocks rendering of protected routes until a valid session is confirmed
 * AND belongs to one of `allowedRoles` for this portal.
 *
 * Marketplace, compliance, and the miner portal all store their session
 * under the same sessionStorage token keys (see use-marketplace-auth.ts),
 * so a token being present here doesn't mean it belongs to the right kind
 * of account - a signed-in Buyer can carry a perfectly valid token into
 * /dashboard/* (miner portal) just by navigating there, and would land on
 * it as if they were a miner without a role check. `allowedRoles` lets each
 * portal's layout (dashboard/layout.tsx, compliancedashboard/layout.tsx)
 * declare which backend `role` values it accepts.
 */
export default function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const allowedRolesKey = allowedRoles.join(",");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!hasValidSession()) {
        if (!cancelled) setAuthorized(false);
        router.replace("/login");
        return;
      }

      try {
        const res = await getUser();
        const role = res?.data?.role;
        if (cancelled) return;
        if (role && allowedRoles.includes(role)) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          router.replace("/login");
        }
      } catch {
        if (!cancelled) {
          setAuthorized(false);
          router.replace("/login");
        }
      }
    };

    check();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) check();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, allowedRolesKey]);

  if (!authorized) return null;

  return <>{children}</>;
}
