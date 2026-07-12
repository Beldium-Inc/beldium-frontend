"use client";
import { OnboardingWizard } from "@/src/features/onboarding/OnboardingWizard";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

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
        router.replace("/onboarding");
        return;
      }
      const hasRegistered =
        typeof window !== "undefined" ? localStorage.getItem("hasRegistered") === "true" : false;
      const allowRegistration =
        typeof window !== "undefined" ? sessionStorage.getItem("allowRegistration") === "true" : false;

      if (hasRegistered && !allowRegistration) {
        router.replace("/login");
      }
    };
    guard();
  }, [router]);

  return <OnboardingWizard />;
}
