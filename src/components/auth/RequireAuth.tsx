"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function hasValidSession(): boolean {
  // Only gate on token presence. Actual expiry is enforced server-side and
  // handled by the axios 401 -> refresh flow, so this doesn't boot users to
  // /login on a stale client clock while their session is still good.
  return Boolean(sessionStorage.getItem("accessToken"));
}

/**
 * Blocks rendering of protected routes until a valid session is confirmed.
 * Re-checks on `pageshow` so a bfcache-restored page (e.g. hitting Back
 * after logout) is re-validated instead of showing stale authenticated UI.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = () => {
      if (hasValidSession()) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
        router.replace("/login");
      }
    };

    check();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) check();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  if (!authorized) return null;

  return <>{children}</>;
}
