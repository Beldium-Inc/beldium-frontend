// steps/CompleteProfileStep.tsx
"use client";

import { Button } from "antd";
import { ArrowRightIcon } from "../ui/ArrowIcon";

export function CompleteProfileStep({
  onComplete,
  onSkip,
  completion = 10,
}: {
  onComplete: () => void;
  onSkip: () => void;
  completion?: number;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Complete your profile</h2>
      <div className="h-px bg-gray-200 mb-6" />

      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        We need a few more details to activate your Beldium account and begin onboarding
      </p>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <span>Profile completion: {completion}%</span>
        <span className="h-1 w-1 rounded-full bg-gray-400" />
        <span>Takes about 3-5 minutes</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 mb-8 overflow-hidden">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="flex items-center gap-6">
        <Button
          type="primary"
          size="large"
          onClick={onComplete}
          className="text-sm! h-12! px-6! flex items-center justify-center gap-2 bg-slate-900! border-slate-900!"
        >
          Complete Profile
          <ArrowRightIcon />
        </Button>
        <button onClick={onSkip} className="text-sm text-gray-600 hover:text-gray-900">
          Do this later
        </button>
      </div>
    </div>
  );
}