"use client";

import { useEffect, useState } from "react";
import { CloseOutlined, DownOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type {
  CreateRuleDraft,
  CreateRuleCondition,
  CreateRuleDraftField,
  CreateRuleValidationField,
} from "@/src/features/compliance/dashboard/lib/rule-drafts";
import {
  CREATE_RULE_STEP_COPY,
  CREATE_RULE_CATEGORY_OPTIONS,
  CREATE_RULE_TRIGGER_OPTIONS,
  CREATE_RULE_OPERATOR_OPTIONS,
  CREATE_RULE_UNIT_OPTIONS,
  CREATE_RULE_ACTION_OPTIONS,
  CREATE_RULE_SEVERITY_OPTIONS,
  CREATE_RULE_SCOPE_OPTIONS,
} from "@/src/features/compliance/dashboard/lib/rule-drafts";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";

export const INITIAL_CREATE_RULE_DRAFT: CreateRuleDraft = {
  ruleName: "",
  category: "",
  description: "",
  conditions: [
    {
      id: "condition-1",
      field: "",
      operator: ">",
      value: "",
      unit: "Tons",
    },
  ],
  actionType: "",
  severity: "",
  ruleScope: "All Jurisdiction",
  reviewNotes: "",
  notifyOfficer: true,
  createAuditLog: true,
};

export const CREATE_RULE_FIELD_LABELS: Record<CreateRuleValidationField, string> = {
  ruleName: "Rule Name",
  category: "Compliance Category",
  description: "Rule Description",
  conditions: "Rule Conditions",
  actionType: "Automated Action",
  severity: "Risk Level",
  ruleScope: "Rule Scope",
  reviewNotes: "Review Notes",
  notifyOfficer: "Notify Assigned Officer",
  createAuditLog: "Create Audit Log",
};

export function CreateRuleFieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block text-[16px] font-medium text-[#2a2f39]">
      {label} {required ? <span className="text-[#ef2f32]">*</span> : null}
    </label>
  );
}

export function CreateRuleErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-[13px] text-[#ef2f32]">{message}</p>;
}

export function CreateRuleModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: CreateRuleDraft) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CreateRuleDraft>(INITIAL_CREATE_RULE_DRAFT);
  const [errors, setErrors] = useState<
    Partial<Record<CreateRuleValidationField, string>>
  >({});

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const updateField = <T extends CreateRuleDraftField>(
    field: T,
    value: CreateRuleDraft[T],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const updateCondition = (
    conditionId: string,
    field: keyof CreateRuleCondition,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.map((condition) =>
        condition.id === conditionId
          ? { ...condition, [field]: value }
          : condition,
      ),
    }));
    setErrors((current) => {
      if (!current.conditions) {
        return current;
      }

      const next = { ...current };
      delete next.conditions;
      return next;
    });
  };

  const addCondition = () => {
    setDraft((current) => ({
      ...current,
      conditions: [
        ...current.conditions,
        {
          id: `condition-${current.conditions.length + 1}`,
          field: "",
          operator: ">",
          value: "",
          unit: "Tons",
        },
      ],
    }));
    setErrors((current) => {
      if (!current.conditions) {
        return current;
      }

      const next = { ...current };
      delete next.conditions;
      return next;
    });
  };

  const validateCurrentStep = () => {
    const requiredFieldsByStep: Array<CreateRuleValidationField[]> = [
      ["ruleName", "category", "description"],
      ["conditions", "actionType"],
      ["severity", "ruleScope"],
    ];
    const nextErrors: Partial<Record<CreateRuleValidationField, string>> = {};

    requiredFieldsByStep[step].forEach((field) => {
      if (field === "conditions") {
        const hasInvalidCondition = draft.conditions.some(
          (condition) =>
            !condition.field.trim() ||
            !condition.operator.trim() ||
            !condition.value.trim(),
        );

        if (hasInvalidCondition) {
          nextErrors.conditions = `${CREATE_RULE_FIELD_LABELS.conditions} are required`;
        }
        return;
      }

      const value = draft[field];

      if (typeof value === "string" && !value.trim()) {
        nextErrors[field] = `${CREATE_RULE_FIELD_LABELS[field]} is required`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (step === CREATE_RULE_STEP_COPY.length - 1) {
      onSubmit(draft);
      return;
    }

    setStep((current) => current + 1);
  };

  const currentStepCopy = CREATE_RULE_STEP_COPY[step];
  const fieldClassName =
    "w-full rounded-[20px] border border-[#ccd6e5] bg-white px-6 text-[18px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#8f97a6] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.24)] px-4 py-8 backdrop-blur-[5px]">
      <button
        type="button"
        aria-label="Close create rule modal"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[1080px] overflow-hidden rounded-[20px] bg-white shadow-[0_40px_120px_-42px_rgba(16,30,61,0.45)]">
        <div className="border-b border-[#eef2f7] px-8 py-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-[#2a2f39]">
                Create New Rule
              </h2>
              <p className="mt-2 text-[16px] text-[#8a92a1]">
                Step {step + 1} of {CREATE_RULE_STEP_COPY.length} • {currentStepCopy}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-[22px] text-[#2a3142] transition-colors hover:bg-[#f7f9fc]"
            >
              <CloseOutlined />
            </button>
          </div>
        </div>

        <div className="px-8 py-7">
          <div className="grid grid-cols-3 gap-7">
            {CREATE_RULE_STEP_COPY.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className={classNames(
                  "h-1.5 rounded-full",
                  index <= step ? "bg-[#8e9ab0]" : "bg-[#e8ecf3]",
                )}
              />
            ))}
          </div>

          {step === 0 ? (
            <div className="mt-8 space-y-8">
              <div>
                <CreateRuleFieldLabel label="Rule Name" required />
                <input
                  type="text"
                  value={draft.ruleName}
                  onChange={(event) => updateField("ruleName", event.target.value)}
                  placeholder="e.g. Lithium Export License Required"
                  className={classNames(fieldClassName, "mt-3 h-20")}
                />
                <CreateRuleErrorText message={errors.ruleName} />
              </div>

              <div>
                <CreateRuleFieldLabel label="Compliance Category" required />
                <div className="relative mt-3">
                  <select
                    value={draft.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className={classNames(
                      fieldClassName,
                      "h-20 appearance-none pr-16",
                      !draft.category && "text-[#8f97a6]",
                    )}
                  >
                    <option value="">Select your compliance category</option>
                    {CREATE_RULE_CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <DownOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#14244a]" />
                </div>
                <CreateRuleErrorText message={errors.category} />
              </div>

              <div>
                <CreateRuleFieldLabel label="Rule Description" required />
                <textarea
                  value={draft.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe what this rule evaluates and why it is required"
                  className={classNames(fieldClassName, "mt-3 h-40 py-5")}
                />
                <CreateRuleErrorText message={errors.description} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-8 space-y-8">
              <div>
                <CreateRuleFieldLabel label="Rule Name" required />
                <div className="mt-3 rounded-[24px] border border-[#b7c5d9] bg-white p-6">
                  <div className="space-y-4 rounded-[24px] bg-[#fafbfd] p-5">
                    {draft.conditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_170px_minmax(0,1.1fr)]"
                      >
                        <div className="relative">
                          <select
                            value={condition.field}
                            onChange={(event) =>
                              updateCondition(
                                condition.id,
                                "field",
                                event.target.value,
                              )
                            }
                            className={classNames(
                              fieldClassName,
                              "h-20 appearance-none pr-16",
                              !condition.field && "text-[#8f97a6]",
                            )}
                          >
                            <option value="">Select field</option>
                            {CREATE_RULE_TRIGGER_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <DownOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#8f97a6]" />
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
                            className={classNames(
                              fieldClassName,
                              "h-20 appearance-none pr-16 text-center",
                              !condition.operator && "text-[#8f97a6]",
                            )}
                          >
                            {CREATE_RULE_OPERATOR_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <DownOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#8f97a6]" />
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(event) =>
                              updateCondition(
                                condition.id,
                                "value",
                                event.target.value,
                              )
                            }
                            placeholder="Value"
                            className={classNames(
                              fieldClassName,
                              "h-20 pr-[132px]",
                            )}
                          />
                          <div className="absolute inset-y-0 right-5 flex items-center">
                            <div className="relative">
                              <select
                                value={condition.unit}
                                onChange={(event) =>
                                  updateCondition(
                                    condition.id,
                                    "unit",
                                    event.target.value,
                                  )
                                }
                                className="h-12 appearance-none rounded-[16px] border border-[#d7deea] bg-[#f7f9fc] px-4 pr-10 text-[16px] text-[#5d6675] outline-none"
                              >
                                {CREATE_RULE_UNIT_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <DownOutlined className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8f97a6]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addCondition}
                    className="mt-5 flex h-20 w-full items-center justify-center gap-4 rounded-[20px] border border-dashed border-[#657184] bg-white text-[18px] font-medium text-[#8a92a1] transition-colors hover:bg-[#fafbfd]"
                  >
                    Add another condition
                    <PlusOutlined />
                  </button>
                </div>
                <CreateRuleErrorText message={errors.conditions} />
              </div>

              <div>
                <CreateRuleFieldLabel label="System Action" required />
                <div className="relative mt-3">
                  <select
                    value={draft.actionType}
                    onChange={(event) => updateField("actionType", event.target.value)}
                    className={classNames(
                      fieldClassName,
                      "h-20 appearance-none pr-16",
                      !draft.actionType && "text-[#8f97a6]",
                    )}
                  >
                    <option value="">Select what happens when rule is triggered</option>
                    {CREATE_RULE_ACTION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <DownOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#14244a]" />
                </div>
                <CreateRuleErrorText message={errors.actionType} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-8 space-y-8">
              <div>
                <CreateRuleFieldLabel label="Severity Level" required />
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {CREATE_RULE_SEVERITY_OPTIONS.map((option) => {
                    const toneClassName =
                      option === "High"
                        ? "bg-[#f44344]"
                        : option === "Medium"
                          ? "bg-[#f3a10d]"
                          : "bg-[#18b829]";

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("severity", option)}
                        className={classNames(
                          "rounded-[20px] border bg-white px-6 py-9 text-center transition-colors",
                          draft.severity === option
                            ? "border-[#14244a] shadow-[0_0_0_3px_rgba(20,36,74,0.08)]"
                            : "border-[#ccd6e5] hover:border-[#aab8cc]",
                        )}
                      >
                        <span
                          className={classNames(
                            "mx-auto block h-5 w-5 rounded-full",
                            toneClassName,
                          )}
                        />
                        <span className="mt-5 block text-[20px] font-medium text-[#2a2f39]">
                          {option} Risk
                        </span>
                      </button>
                    );
                  })}
                </div>
                <CreateRuleErrorText message={errors.severity} />
              </div>

              <div>
                <CreateRuleFieldLabel label="Rule Scope" required />
                <div className="relative mt-3">
                  <select
                    value={draft.ruleScope}
                    onChange={(event) => updateField("ruleScope", event.target.value)}
                    className={classNames(
                      fieldClassName,
                      "h-20 appearance-none pr-16",
                      !draft.ruleScope && "text-[#8f97a6]",
                    )}
                  >
                    {CREATE_RULE_SCOPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <DownOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#14244a]" />
                </div>
                <CreateRuleErrorText message={errors.ruleScope} />
              </div>

              <div className="flex items-start gap-4 rounded-[20px] border border-[#bfd6ff] bg-[#eef4ff] px-6 py-5">
                <span className="mt-1 text-[22px] text-[#5c92ff]">
                  <InfoCircleOutlined />
                </span>
                <p className="text-[16px] leading-7 text-[#5c92ff]">
                  This rule will be created as a Draft and must be published to
                  take effect on new miner submissions.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-[#eef2f7] px-8 py-7 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-14 items-center justify-center rounded-[10px] px-4 text-[13px] font-medium text-[#14244a] transition-colors hover:bg-[#f7f9fc]"
          >
            Cancel
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d7deea] bg-[#f1f4f8] px-4 text-[13px] font-medium text-[#14244a] transition-colors hover:bg-[#e9eef5]"
              >
                Back
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
              style={primaryActionStyle}
            >
              {step === CREATE_RULE_STEP_COPY.length - 1 ? "Create Rule" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

