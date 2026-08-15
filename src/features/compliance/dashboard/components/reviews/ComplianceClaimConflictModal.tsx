"use client";

import { WarningFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { formatReviewAttemptTime } from "@/src/features/compliance/dashboard/lib/format";

export default function ComplianceClaimConflictModal({
  minerCode,
  loggedAt,
  onBack,
}: {
  minerCode?: string;
  loggedAt: Date;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,13,28,0.28)] backdrop-blur-[4px] px-4">
      <div className="w-full max-w-[720px] rounded-[20px] bg-white p-6 shadow-[0_40px_90px_-40px_rgba(16,30,61,0.55)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffe9ea] text-[40px] text-[#ef2f32]">
          <WarningFilled />
        </div>

        <div className="mt-6 text-center">
          <div className="text-[32px] font-semibold tracking-[-0.04em] text-[#2a2f39]">
            Task Already Claimed
          </div>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-8 text-[#6a7282]">
            Another regulator has claimed{" "}
            <span className="font-semibold text-[#2a2f39]">
              Miner ID: #{minerCode ?? "Unavailable"}
            </span>
            . Please select a different task from the queue.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-8 inline-flex h-11 w-full items-center justify-center gap-3 rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
          style={primaryActionStyle}
        >
          <ArrowLeftOutlined />
          Back to Queue
        </button>

        <div className="mt-6 border-t border-[#edf1f7] pt-5 text-center text-[14px] text-[#8a92a1]">
          Failed attempt logged at {formatReviewAttemptTime(loggedAt)} WAT
        </div>
      </div>
    </div>
  );
}

