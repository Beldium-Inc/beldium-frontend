"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "./onboarding.store";
import { OnboardingLayout } from "./OnboardingLayout";
import { Onboard } from "./Onboard";
import { StepOne } from "./steps/StepOne";
import { VerifySuccess } from "./steps/VerifySuccess";

// Renders steps 2+; step 1 (role selection) lives on its own route ("/").
export function OnboardingWizard() {
  const router = useRouter();
  const { step, data, setStep } = useOnboardingStore();

  if (step <= 2) {
    return (
      <OnboardingLayout>
        <Onboard
          data={data}
          onNext={() => setStep(3)}
          onBack={() => {
            setStep(1);
            router.push("/");
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
