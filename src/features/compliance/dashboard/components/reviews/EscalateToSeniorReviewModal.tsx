"use client";

import { useState } from "react";
import { CloseOutlined, DownOutlined, UploadOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";

export type EscalationLevel = "significant" | "critical" | "catastrophic";

export const ESCALATION_LEVELS: { key: EscalationLevel; label: string; caption: string }[] = [
  { key: "significant", label: "Level 1", caption: "Significant" },
  { key: "critical", label: "Level 2", caption: "Critical" },
  { key: "catastrophic", label: "Level 3", caption: "Catastrophic" },
];

export const ESCALATION_REASONS = [
  "Missing or invalid license documentation",
  "Environmental impact assessment discrepancy",
  "Repeated non-compliance with safety measures",
  "Community consent concerns",
  "Suspected fraudulent submission",
];

export default function EscalateToSeniorReviewModal({
  minerCode,
  onClose,
  onConfirm,
}: {
  minerCode: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [level, setLevel] = useState<EscalationLevel>("significant");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,13,28,0.28)] backdrop-blur-[4px] px-4">
      <div className="w-full max-w-[600px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_90px_-40px_rgba(16,30,61,0.55)]">
        <div className="h-1 w-full bg-[#ef2f32]" />
        <div className="flex items-center justify-between px-6 py-5">
          <div className="text-[20px] font-semibold text-[#2a2f39]">Escalate to Senior Review</div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a92a1] hover:bg-[#f4f6fa]"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 pb-2">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
              Risk assessment level
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {ESCALATION_LEVELS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLevel(item.key)}
                  className={classNames(
                    "rounded-[14px] border px-3 py-4 text-center transition-colors",
                    level === item.key
                      ? "border-[#ef2f32] bg-[#fff2f2]"
                      : "border-[#e5e9f1] bg-white",
                  )}
                >
                  <div className="text-[13px] text-[#8a92a1]">{item.label}</div>
                  <div
                    className={classNames(
                      "mt-1 text-[15px] font-semibold",
                      item.key === "catastrophic" ? "text-[#ef2f32]" : "text-[#2a2f39]",
                    )}
                  >
                    {item.caption}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
              Select primary reason
            </div>
            <div className="relative mt-3">
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="h-12 w-full appearance-none rounded-[12px] border border-[#dce3ef] bg-white px-4 pr-10 text-[14px] text-[#2a2f39] outline-none"
              >
                <option value="">Choose a reason for escalation</option>
                {ESCALATION_REASONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <DownOutlined className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#8a92a1]" />
            </div>
          </div>

          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
              Evidence &amp; documentation
            </div>
            <button
              type="button"
              onClick={() => showToast("File upload isn't connected to the backend yet.", "error")}
              className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#dce3ef] bg-[#fafbfd] py-8 text-center"
            >
              <UploadOutlined className="text-[22px] text-[#8a92a1]" />
              <span className="text-[14px] text-[#2a2f39]">Choose file or drag and drop it here</span>
              <span className="text-[12px] text-[#a0a7b5]">JPEG, PNG, and PDF formats, up to 20 MB.</span>
              <span className="mt-2 rounded-[10px] border border-[#dce3ef] bg-white px-4 py-2 text-[13px] font-medium text-[#2a2f39]">
                Browse files
              </span>
            </button>
          </div>

          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
              Internal analyst notes
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Detail the specific findings and justification for this escalation..."
              className="mt-3 h-28 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#2a2f39] outline-none placeholder:text-[#a0a7b5]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#edf1f7] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium text-[#5d6675]"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={submitting || !reason}
            onClick={() => {
              setSubmitting(true);
              window.setTimeout(() => {
                setSubmitting(false);
                showToast(`Miner ${minerCode} escalated to senior review.`, "success");
                onConfirm();
              }, 400);
            }}
            style={primaryActionStyle}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#ef2f32] px-5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Working..." : "Confirm escalation"}
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}

