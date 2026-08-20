"use client";
import { useOnboardingStore } from "@/src/features/onboarding/onboarding.store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/src/features/onboarding/api";

// Compliance / regulator partner signup entry point. Mirrors "/" (the Miner
// entry point) but presets role="partner" so a compliance partner never
// sees the Miner-vs-Compliance chooser - that screen (RoleSelection) is
// hidden for now; see src/app/page.tsx for how to restore it if a shared
// chooser is wanted again.
export default function CompliancePage() {
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
          router.replace("/complianceonboarding");
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

      setData({ role: "partner" });
      setStep(2);
      router.replace("/register");
    };
    guard();
  }, [router, setStep, setData]);

  return null;
}
