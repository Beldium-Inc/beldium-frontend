"use client";
import { useOnboardingStore } from "@/src/features/onboarding/onboarding.store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/src/features/onboarding/api";

// Miner-only entry point. The Miner-vs-Compliance role chooser
// (RoleSelection) is hidden for now - Miner and Compliance now have fully
// separate entry points ("/" for Miner, "/compliance" for Compliance) so a
// miner never sees the option to create a compliance account. See the
// commented-out block at the bottom of this file to restore the chooser.
export default function Home() {
  const router = useRouter();
  const { setStep, setData } = useOnboardingStore();

  useEffect(() => {
    const guard = async () => {
      if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      const access = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
      if (access) {
        const expiresAt = sessionStorage.getItem("tokenExpiration");
        if (expiresAt && Date.now() > Number(expiresAt)) {
          sessionStorage.clear();
          return;
        }

        try {
          const userRes = await getUser();
          const completed = userRes?.data?.has_completed_onboarding;
          const role = userRes?.data?.role;

          if (completed) {
            router.replace(role === "Compliance" ? "/compliancedashboard?persona=admin" : "/dashboard");
          } else {
            router.replace(role === "Compliance" ? "/complianceonboarding" : "/onboarding");
          }
        } catch {
          router.replace("/onboarding");
        }
        return;
      }
      const hasRegistered =
        typeof window !== "undefined" ? localStorage.getItem("hasRegistered") === "true" : false;
      const allowRegistration =
        typeof window !== "undefined" ? sessionStorage.getItem("allowRegistration") === "true" : false;

      if (hasRegistered && !allowRegistration) {
        router.replace("/login");
        return;
      }

      setData({ role: "miner" });
      setStep(2);
      router.replace("/register");
    };
    guard();
  }, [router, setStep, setData]);

  return null;
}

/*
 * Role-selection screen - commented out, not deleted. Restore by:
 *   1. Reverting this file to render <RoleSelection onNext={...} /> when
 *      step <= 1 (as it did before), instead of presetting role="miner"
 *      and redirecting straight to /register.
 *   2. Optionally retiring the separate "/compliance" entry point in
 *      src/app/compliance/page.tsx if a shared chooser is preferred again.
 *
 * import { RoleSelection } from "@/src/features/onboarding/steps/RoleSelection";
 *
 * if (step > 1) return null;
 * return (
 *   <RoleSelection
 *     onNext={() => {
 *       setStep(2);
 *       router.push("/register");
 *     }}
 *   />
 * );
 */
