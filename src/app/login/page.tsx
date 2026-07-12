"use client";
import { Login } from "@/src/features/login/Login";
import { OnboardingLayout } from "@/src/features/onboarding/OnboardingLayout";

export default function Page() {
  return (
    <OnboardingLayout>
      <Login />
    </OnboardingLayout>
  );
}
