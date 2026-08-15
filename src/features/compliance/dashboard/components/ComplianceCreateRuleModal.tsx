"use client";

import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { showToast } from "@/src/store/toast.store";

const CATEGORY_OPTIONS = [
  "Environmental Impact Assessments (EIAs)",
  "ESG Framework Design & Reporting",
  "Community & Social Impact Advisory",
  "Export & Trade Documentation",
] as const;

const FIELD_OPTIONS = [
  "Production Volume",
  "EIA Submission Status",
  "Permit Expiry Date",
  "Worker Safety Training Age",
] as const;

const OPERATOR_OPTIONS = [">", "<", "=", "is missing", "expires within"] as const;
const UNIT_OPTIONS = ["Tons", "Days", "Months", "Submission"] as const;
const SYSTEM_ACTION_OPTIONS = [
  "Auto Flag Miner",
  "Issue Warning",
  "Escalate to Compliance Officer",
  "Block Submission",
] as const;
const RULE_SCOPE_OPTIONS = [
  "All Jurisdiction",
  "Federal Only",
  "State Level",
  "Pilot Phase",
] as const;
const SEVERITY_OPTIONS = [
  { label: "Low Risk", toneClassName: "bg-[#18b829]" },
  { label: "Medium Risk", toneClassName: "bg-[#f3a10d]" },
  { label: "High Risk", toneClassName: "bg-[#f44344]" },
] as const;

type RuleCondition = {
  id: number;
  field: string;
  operator: string;
  value: string;
  unit: string;
};

function StepProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <span className={`h-1.5 rounded-full ${step >= 1 ? "bg-[#9098ac]" : "bg-[#edf1f6]"}`} />
      <span className={`h-1.5 rounded-full ${step >= 2 ? "bg-[#9098ac]" : "bg-[#edf1f6]"}`} />
      <span className={`h-1.5 rounded-full ${step >= 3 ? "bg-[#9098ac]" : "bg-[#edf1f6]"}`} />
    </div>
  );
}

export default function ComplianceCreateRuleModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [ruleName, setRuleName] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>(
    CATEGORY_OPTIONS[0],
  );
  const [description, setDescription] = useState("");
  const [systemAction, setSystemAction] = useState<
    (typeof SYSTEM_ACTION_OPTIONS)[number]
  >(SYSTEM_ACTION_OPTIONS[0]);
  const [severity, setSeverity] = useState<(typeof SEVERITY_OPTIONS)[number]["label"]>(
    "Low Risk",
  );
  const [ruleScope, setRuleScope] = useState<(typeof RULE_SCOPE_OPTIONS)[number]>(
    RULE_SCOPE_OPTIONS[0],
  );
  const [nextConditionId, setNextConditionId] = useState(2);
  const [conditions, setConditions] = useState<RuleCondition[]>([
    {
      id: 1,
      field: "",
      operator: OPERATOR_OPTIONS[0],
      value: "",
      unit: UNIT_OPTIONS[0],
    },
  ]);

  const updateCondition = <K extends keyof RuleCondition>(
    id: number,
    field: K,
    value: RuleCondition[K],
  ) => {
    setConditions((current) =>
      current.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition,
      ),
    );
  };

  const addCondition = () => {
    setConditions((current) => [
      ...current,
      {
        id: nextConditionId,
        field: "",
        operator: OPERATOR_OPTIONS[0],
        value: "",
        unit: UNIT_OPTIONS[0],
      },
    ]);
    setNextConditionId((current) => current + 1);
  };

  const removeCondition = (id: number) => {
    setConditions((current) =>
      current.length === 1
        ? current
        : current.filter((condition) => condition.id !== id),
    );
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
      return;
    }

    showToast(
      `Mock rule created for ${ruleName || "new rule"}. API wiring is pending.`,
      "success",
    );
    onClose();
  };

  const subtitle =
    currentStep === 1
      ? "Step 1 of 3 • Define compliance evaluation criteria"
      : currentStep === 2
        ? "Step 2 of 3 • Define compliance evaluation criteria"
        : "Step 3 of 3 • Define compliance evaluation criteria";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.74)] px-4 py-8">
      <div className="relative max-h-[90vh] w-full max-w-[860px] overflow-y-auto rounded-[20px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-start justify-between border-b border-[#edf1f6] px-7 py-6">
          <div>
            <h2 className="text-[18px] font-semibold text-[#252b37] sm:text-[20px]">
              Create New Rule
            </h2>
            <p className="mt-1 text-[15px] text-[#8a92a1]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-[#303744] transition-colors hover:bg-[#f7f9fc]"
            aria-label="Close create rule modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="px-7 py-5">
          <StepProgress step={currentStep} />
        </div>

        {currentStep === 1 ? (
          <div className="space-y-6 px-7 py-2 pb-8">
            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Rule Name <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                value={ruleName}
                onChange={(event) => setRuleName(event.target.value)}
                placeholder="e.g. Lithium Export License Required"
                className="mt-3 h-16 w-full rounded-[18px] border border-[#d9e0ec] px-5 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
              />
            </div>

            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Compliance Category <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative mt-3">
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as (typeof CATEGORY_OPTIONS)[number])
                  }
                  className="h-16 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
              </div>
            </div>

            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Rule Description <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                placeholder="Describe what this rule evaluates and why it is required"
                className="mt-3 w-full rounded-[18px] border border-[#d9e0ec] px-5 py-4 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
              />
            </div>
          </div>
        ) : currentStep === 2 ? (
          <div className="space-y-6 px-7 py-2 pb-8">
            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Trigger Conditions <span className="text-[#ef4444]">*</span>
              </label>

              <div className="mt-3 rounded-[22px] border border-[#cfd8e8] bg-white p-5">
                <div className="space-y-4 rounded-[20px] bg-[#f8fafc] p-5">
                  {conditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_1.4fr_auto]"
                    >
                      <div className="relative">
                        <select
                          value={condition.field}
                          onChange={(event) =>
                            updateCondition(condition.id, "field", event.target.value)
                          }
                          className="h-16 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                        >
                          <option value="">Select field</option>
                          {FIELD_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
                      </div>

                      <div className="relative">
                        <select
                          value={condition.operator}
                          onChange={(event) =>
                            updateCondition(
                              condition.id,
                              "operator",
                              event.target.value,
                            )
                          }
                          className="h-16 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[20px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                        >
                          {OPERATOR_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(event) =>
                            updateCondition(condition.id, "value", event.target.value)
                          }
                          placeholder="Value"
                          className="h-16 w-full rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-28 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <div className="relative">
                            <select
                              value={condition.unit}
                              onChange={(event) =>
                                updateCondition(condition.id, "unit", event.target.value)
                              }
                              className="h-10 appearance-none rounded-[14px] border border-[#e1e6ef] bg-[#f7f9fc] px-3 pr-8 text-[15px] text-[#5d6675] outline-none"
                            >
                              {UNIT_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <DownOutlined className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8f97a6]" />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCondition(condition.id)}
                        disabled={conditions.length === 1}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d9e0ec] bg-white text-[16px] text-[#8f97a6] transition-colors hover:bg-[#f7f9fc] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Remove condition"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addCondition}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#707784] bg-white text-[13px] font-medium text-[#7d8594] transition-colors hover:bg-[#fbfcfe]"
                >
                  Add another condition
                  <PlusOutlined />
                </button>
              </div>
            </div>

            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                System Action <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative mt-3">
                <select
                  value={systemAction}
                  onChange={(event) =>
                    setSystemAction(
                      event.target.value as (typeof SYSTEM_ACTION_OPTIONS)[number],
                    )
                  }
                  className="h-16 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                >
                  {SYSTEM_ACTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 px-7 py-2 pb-8">
            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Severity Level <span className="text-[#ef4444]">*</span>
              </label>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {SEVERITY_OPTIONS.map((option) => {
                  const active = severity === option.label;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSeverity(option.label)}
                      className={
                        active
                          ? "rounded-[18px] border border-[#ccd6e5] bg-[#f1f2f4] px-4 py-8 text-center transition-colors"
                          : "rounded-[18px] border border-[#ccd6e5] bg-white px-4 py-8 text-center transition-colors hover:border-[#aab8cc]"
                      }
                    >
                      <span
                        className={`mx-auto block h-4 w-4 rounded-full ${option.toneClassName}`}
                      />
                      <span className="mt-5 block text-[18px] font-medium text-[#2a2f39]">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Rule Scope <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative mt-3">
                <select
                  value={ruleScope}
                  onChange={(event) =>
                    setRuleScope(
                      event.target.value as (typeof RULE_SCOPE_OPTIONS)[number],
                    )
                  }
                  className="h-16 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                >
                  {RULE_SCOPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-[18px] border border-[#cfe0ff] bg-[#eef5ff] px-5 py-4 text-[#4f88ff]">
              <InfoCircleOutlined className="mt-0.5 text-[20px]" />
              <p className="text-[15px] leading-7">
                This rule will be created as a Draft and must be published to
                take effect on new miner submissions.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[#edf1f6] px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-16 items-center justify-center rounded-[18px] px-8 text-[16px] font-medium text-[#24324c] transition-colors hover:bg-[#f7f9fc]"
          >
            Cancel
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {currentStep !== 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentStep((current) =>
                    current === 3 ? 2 : 1,
                  )
                }
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#dfe5ef] bg-[#f7f9fc] px-4 text-[13px] font-medium text-[#24324c] transition-colors hover:bg-[#eff3f8]"
              >
                Back
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#13264e] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182f5f]"
              style={{ color: "#ffffff" }}
            >
              {currentStep === 3 ? "Create Rule" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
