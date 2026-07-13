import { useUIStore } from "@/src/store/ui/ui.store";
import { useProfileOnboardStore } from "./profileOnboard.store";
import { StepOne } from "./steps/StepOne";
import { StepTwo } from "./steps/StepTwo";
import { StepThree } from "./steps/StepThree";
import { StepFour } from "./steps/StepFour";
import { StepFive } from "./steps/StepFive";
import { StepSix } from "./steps/StepSix";
import { StepComplete } from "./steps/StepComplete";


export function ProfileOnboardWizard() {
  const { step, setStep, data } = useProfileOnboardStore();
  const { closeAlertModal } = useUIStore();

  const next = () => {
    setStep(step + 1);
    closeAlertModal();
  };

  return (
    <div className="w-full px-6 sm:px-10 min-h-[550px] flex flex-col justify-center">
      {step === 1 && <StepOne data={data} onNext={next} />}
      {step === 2 && <StepTwo data={data} onNext={next} />}
      {step === 3 && <StepThree data={data} onNext={next} />}
      {step === 4 && <StepFour data={data} onNext={next} />}
      {step === 5 && <StepFive data={data} onNext={next} />}
      {step === 6 && <StepSix data={data} onNext={next} />}
      {step === 7 && <StepComplete data={data} onNext={next} />}
    </div>
  );
}
