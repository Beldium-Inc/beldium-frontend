import React from "react";
import { useComplianceOnboardStore } from "../complianceOnboard.store";

function MobileTimeline() {
  const { step, totalSteps } = useComplianceOnboardStore();
  const currentStep = step;
  return (
    <div className="flex items-center gap-4 lg:hidden">
      <div className="flex flex-1 items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const s = index + 1;
          const isCompleted = s < currentStep;
          const isActive = s === currentStep;
          return (
            <div
              key={s}
              className={`h-[3px] flex-1 rounded-full ${
                isCompleted || isActive ? "bg-[#0f172a]" : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}

export default MobileTimeline;
