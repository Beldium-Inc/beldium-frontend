"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "./onboarding.store";
import { OnboardingLayout } from "./OnboardingLayout";
import { Onboard } from "./Onboard";
import { StepOne } from "./steps/StepOne";
import { VerifySuccess } from "./steps/VerifySuccess";

// Renders steps 2+. Step 1 (the role chooser) is currently hidden — Miner
// and Compliance each have their own entry route ("/" and "/compliance")
// that preset `data.role` and jump straight to step 2, so "back" from here
// needs to return to whichever entry route matches the current role rather
// than a shared "/".
export function OnboardingWizard() {
  const router = useRouter();
  const { step, data, setStep } = useOnboardingStore();
  const entryRoute = data?.role === "partner" ? "/compliance" : "/";

  if (step <= 2) {
    return (
      <OnboardingLayout>
        <Onboard
          data={data}
          onNext={() => setStep(3)}
          onBack={() => {
            setStep(1);
            router.push(entryRoute);
          }}
        />
      </OnboardingLayout>
    );
  }

  if (step === 3) {
    return (
      <OnboardingLayout>
        <StepOne data={data} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <VerifySuccess onBack={() => setStep(3)} />
    </OnboardingLayout>
  );
}
