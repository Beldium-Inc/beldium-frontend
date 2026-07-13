import { useUIStore } from "@/src/store/ui/ui.store";
import { useComplianceOnboardStore } from "@/src/features/compliance/complianceOnboard.store";
import { StepOrgIdentity } from "@/src/features/compliance/steps/StepOrgIdentity";
import { StepOnlinePresence } from "@/src/features/compliance/steps/StepOnlinePresence";
import { StepAuthorizedRep } from "@/src/features/compliance/steps/StepAuthorizedRep";
import { StepSectorCoverage } from "@/src/features/compliance/steps/StepSectorCoverage";
import { StepRegBodies } from "@/src/features/compliance/steps/StepRegBodies";
import { StepComplianceFunctions } from "@/src/features/compliance/steps/StepComplianceFunctions";
import { StepExperienceCapacity } from "@/src/features/compliance/steps/StepExperienceCapacity";
import { StepRoleConfirm } from "@/src/features/compliance/steps/StepRoleConfirm";

export function ComplianceOnboardWizard() {
  const { step, setStep, data } = useComplianceOnboardStore();
  const { closeAlertModal } = useUIStore();

  const next = () => {
    setStep(step + 1);
    closeAlertModal();
  };

  return (
    <div className="w-full px-10 lg:px-16 xl:px-36 min-h-[550px] flex flex-col justify-center">
      {step === 1 && <StepOrgIdentity data={data} onNext={next} />}
      {step === 2 && <StepOnlinePresence data={data} onNext={next} />}
      {step === 3 && <StepAuthorizedRep data={data} onNext={next} />}
      {step === 4 && <StepSectorCoverage data={data} onNext={next} />}
      {step === 5 && <StepRegBodies data={data} onNext={next} />}
      {step === 6 && <StepComplianceFunctions data={data} onNext={next} />}
      {step === 7 && <StepExperienceCapacity data={data} onNext={next} />}
      {step === 8 && <StepRoleConfirm data={data} onNext={next} />}
    </div>
  );
}
