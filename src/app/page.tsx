"use client";
import { RoleSelection } from "@/src/features/onboarding/steps/RoleSelection";
import { useOnboardingStore } from "@/src/features/onboarding/onboarding.store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { step, setStep } = useOnboardingStore();

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
        return;
      }

      if (step > 1) {
        router.replace("/register");
      }
    };
    guard();
  }, [router, step]);

  if (step > 1) return null;

  return (
    <RoleSelection
      onNext={() => {
        setStep(2);
        router.push("/register");
      }}
    />
  );
}
