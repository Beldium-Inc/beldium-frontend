import React from "react";
import { useProfileOnboardStore } from "../profileOnboard.store";

function MobileTimeline() {
  const { step, totalSteps } = useProfileOnboardStore();
  const currentStep = step;
  return (
    <div className="flex items-center gap-4 lg:hidden">
     
      {/* Timeline */}
      <div className="flex flex-1 items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div
              key={step}
              className={`
                h-[3px] flex-1 rounded-full
                ${isCompleted || isActive ? "bg-[#0f172a]" : "bg-gray-200"}
              `}
            />
          );
        })}
      </div>

      {/* Step Counter */}
      <span className="text-xs text-gray-500 whitespace-nowrap">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}

export default MobileTimeline;
