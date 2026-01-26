import { useUIStore } from "@/src/store/ui/ui.store";
import { Onboard } from "./Onboard";
import { useOnboardingStore } from "./onboarding.store";
import { StepOne } from "./steps/StepOne";
import { StepTwo } from "./steps/StepTwo";

export function OnboardingWizard() {
  const { step, setStep, data } = useOnboardingStore();
  const { closeAlertModal } = useUIStore();

  const next = () => {
    setStep(step + 1);
    closeAlertModal();
  };
  const back = () => {
    setStep(step - 1);
    closeAlertModal();
  };

  return (
    <div className="w-full px-10 lg:px-16 xl:px-36 min-h-[550px]">
      {step === 1 && <Onboard data={data} onNext={next} />}
      {step === 2 && <StepOne data={data} onNext={next} onBack={back} />}
      {step === 3 && <StepTwo data={data} onNext={next} onBack={back} />}
    </div>
  );
}
