import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useComplianceOnboardStore } from "../complianceOnboard.store";

function MobileTimeline() {
  const { step, totalSteps, setStep } = useComplianceOnboardStore();
  const currentStep = step;
  const canGoBack = currentStep > 1;

  return (
    <div className="flex flex-col gap-4 lg:hidden">
      <button
        type="button"
        onClick={() => canGoBack && setStep(currentStep - 1)}
        disabled={!canGoBack}
        aria-label="Go back"
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition-colors disabled:opacity-0"
      >
        <ArrowLeftOutlined className="text-base" />
      </button>

      <div className="flex items-center gap-4">
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
    </div>
  );
}

export default MobileTimeline;
