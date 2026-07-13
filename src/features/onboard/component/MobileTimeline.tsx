import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useProfileOnboardStore } from "../profileOnboard.store";

function MobileTimeline() {
  const { step, totalSteps, setStep } = useProfileOnboardStore();
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
    </div>
  );
}

export default MobileTimeline;
