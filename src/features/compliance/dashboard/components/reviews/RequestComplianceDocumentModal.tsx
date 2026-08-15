"use client";

import { useState } from "react";
import { CloseOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";

export const REQUIRED_DOCUMENT_OPTIONS = [
  { key: "ssml", label: "SSML / Mining Lease Copy" },
  { key: "financial", label: "Proof of Financial Capability" },
  { key: "eia", label: "Environmental Impact Assessment (EIA)" },
  { key: "site-map", label: "Site Map / Coordinates" },
  { key: "community-consent", label: "Community Consent / CDA" },
  { key: "board-resolution", label: "Board Resolution Documents" },
];

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  ssml: "SSML",
  financial: "FINANCIAL_PROOF",
  eia: "EIA",
  "site-map": "SITE_MAP",
  "community-consent": "COMMUNITY_CONSENT",
  "board-resolution": "BOARD_RESOLUTION",
};

export default function RequestComplianceDocumentModal({
  minerCode,
  onClose,
  onConfirm,
  onSubmit,
}: {
  minerCode: string;
  onClose: () => void;
  onConfirm: () => void;
  onSubmit?: (payload: {
    document_types: string[];
    custom_note?: string;
    priority: "NORMAL" | "HIGH" | "CRITICAL";
  }) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    ssml: true,
    financial: false,
    eia: true,
    "site-map": true,
    "community-consent": false,
    "board-resolution": true,
  });
  const [other, setOther] = useState("");
  const [highPriority, setHighPriority] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,13,28,0.28)] backdrop-blur-[4px] px-4">
      <div className="w-full max-w-[600px] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_90px_-40px_rgba(16,30,61,0.55)]">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="text-[20px] font-semibold text-[#2a2f39]">Request Compliance Document</div>
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
            <div className="text-[13px] font-medium text-[#5d6675]">Required Documents</div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              {REQUIRED_DOCUMENT_OPTIONS.map((option) => (
                <label key={option.key} className="inline-flex cursor-pointer items-start gap-2 text-[14px] text-[#2a2f39]">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[option.key])}
                    onChange={(event) =>
                      setSelected((prev) => ({ ...prev, [option.key]: event.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-[#14244a]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-medium text-[#5d6675]">Other</div>
            <textarea
              value={other}
              onChange={(event) => setOther(event.target.value)}
              placeholder="e.g., Please provide a high-resolution scan of the back page of the license..."
              className="mt-2 h-24 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#2a2f39] outline-none placeholder:text-[#a0a7b5]"
            />
          </div>

          <div className="flex items-center justify-between rounded-[16px] border border-[#e8ecf4] bg-[#fafbfd] p-4">
            <div>
              <div className="text-[14px] font-medium text-[#2a2f39]">Request Priority</div>
              <div className="mt-1 max-w-[380px] text-[12px] text-[#8a92a1]">
                High priority requests trigger a &apos;Critical&apos; flag in the Miner&apos;s notification
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHighPriority((v) => !v)}
              className={classNames(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                highPriority ? "bg-[#1d5de2]" : "bg-[#dce3ef]",
              )}
            >
              <span
                className={classNames(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  highPriority ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
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
            disabled={submitting}
            onClick={async () => {
              const documentTypes = Object.entries(selected)
                .filter(([, checked]) => checked)
                .map(([key]) => DOCUMENT_TYPE_MAP[key]);

              if (documentTypes.length === 0) {
                showToast("Select at least one document to request.", "error");
                return;
              }

              setSubmitting(true);
              try {
                if (onSubmit) {
                  await onSubmit({
                    document_types: documentTypes,
                    custom_note: other.trim() || undefined,
                    priority: highPriority ? "HIGH" : "NORMAL",
                  });
                }
                showToast(`Document request sent for ${minerCode}.`, "success");
                onConfirm();
              } catch {
                // Error toast is handled by the caller's mutation.
              } finally {
                setSubmitting(false);
              }
            }}
            style={primaryActionStyle}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#14244a] px-5 text-[14px] font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Working..." : "Send Request"}
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}

