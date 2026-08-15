"use client";

import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import type { ComplianceRuleRow } from "@/src/features/compliance/dashboard/mock";

const CATEGORY_OPTIONS = [
  "Environmental",
  "ESG",
  "Community",
  "Export",
  "Safety",
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
  "Auto flag miner",
  "High Risk Flag",
  "Issue Warning",
  "Warning Notification",
  "Escalate to Compliance Officer",
  "Missing or expired export document",
] as const;
const RULE_SCOPE_OPTIONS = [
  "All Jurisdiction",
  "Federal Only",
  "State Level",
  "Pilot Phase",
] as const;
const SEVERITY_OPTIONS = [
  { value: "Low", label: "Low Risk", toneClassName: "bg-[#18b829]" },
  { value: "Medium", label: "Medium Risk", toneClassName: "bg-[#f3a10d]" },
  { value: "High", label: "High Risk", toneClassName: "bg-[#f44344]" },
] as const;

type DraftCondition = {
  id: string;
  field: string;
  operator: string;
  value: string;
  unit: string;
};

type RuleConfigurationDraft = {
  ruleName: string;
  category: string;
  description: string;
  conditions: DraftCondition[];
  actionType: string;
  severity: "Low" | "Medium" | "High" | "";
  ruleScope: string;
};

type RuleValidationField =
  | "ruleName"
  | "category"
  | "description"
  | "conditions"
  | "actionType"
  | "severity"
  | "ruleScope";

const FIELD_LABELS: Record<RuleValidationField, string> = {
  ruleName: "Rule Name",
  category: "Compliance Category",
  description: "Rule Description",
  conditions: "Trigger Conditions",
  actionType: "System Action",
  severity: "Severity Level",
  ruleScope: "Rule Scope",
};

function formatTriggerCondition(conditions: DraftCondition[]) {
  return conditions
    .map((condition) =>
      [condition.field, condition.operator, condition.value, condition.unit]
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean)
    .join(" • ");
}

function createDraftFromRule(rule: ComplianceRuleRow): RuleConfigurationDraft {
  return {
    ruleName: rule.name,
    category: rule.category,
    description: rule.description,
    conditions:
      rule.conditions.length > 0
        ? rule.conditions.map((condition, index) => ({
            id: `${rule.id}-condition-${index + 1}`,
            field: condition.field,
            operator: condition.operator,
            value: condition.value,
            unit: condition.unit,
          }))
        : [
            {
              id: `${rule.id}-condition-1`,
              field: "",
              operator: OPERATOR_OPTIONS[0],
              value: "",
              unit: UNIT_OPTIONS[0],
            },
          ],
    actionType: rule.action,
    severity: rule.severityLabel,
    ruleScope: rule.scope,
  };
}

function buildRuleFromDraft(
  baseRule: ComplianceRuleRow,
  draft: RuleConfigurationDraft,
): ComplianceRuleRow {
  return {
    ...baseRule,
    name: draft.ruleName,
    category: draft.category,
    description: draft.description,
    triggerCondition: formatTriggerCondition(draft.conditions),
    conditions: draft.conditions.map((condition) => ({
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
      unit: condition.unit,
    })),
    action: draft.actionType,
    severityLabel: draft.severity || baseRule.severityLabel,
    scope: draft.ruleScope,
  };
}

function FieldLabel({
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

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-[13px] text-[#ef2f32]">{message}</p>;
}

export default function ComplianceRuleConfigurationDrawer({
  rule,
  onClose,
  onSubmit,
}: {
  rule: ComplianceRuleRow;
  onClose: () => void;
  onSubmit: (updatedRule: ComplianceRuleRow, mode: "draft" | "publish") => void;
}) {
  const [draft, setDraft] = useState<RuleConfigurationDraft>(() =>
    createDraftFromRule(rule),
  );
  const [errors, setErrors] = useState<
    Partial<Record<RuleValidationField, string>>
  >({});

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const fieldClassName =
    "w-full rounded-[18px] border border-[#ccd6e5] bg-white px-5 text-[17px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#8f97a6] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]";

  const updateField = <T extends keyof Omit<RuleConfigurationDraft, "conditions">>(
    field: T,
    value: RuleConfigurationDraft[T],
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
    field: keyof DraftCondition,
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
          id: `${rule.id}-condition-${current.conditions.length + 1}`,
          field: "",
          operator: OPERATOR_OPTIONS[0],
          value: "",
          unit: UNIT_OPTIONS[0],
        },
      ],
    }));
  };

  const removeCondition = (conditionId: string) => {
    setDraft((current) => ({
      ...current,
      conditions:
        current.conditions.length > 1
          ? current.conditions.filter((condition) => condition.id !== conditionId)
          : current.conditions,
    }));
  };

  const validateDraft = () => {
    const nextErrors: Partial<Record<RuleValidationField, string>> = {};

    (
      [
        "ruleName",
        "category",
        "description",
        "actionType",
        "severity",
        "ruleScope",
      ] as const
    ).forEach((field) => {
      const value = draft[field];

      if (typeof value === "string" && !value.trim()) {
        nextErrors[field] = `${FIELD_LABELS[field]} is required`;
      }
    });

    const hasInvalidCondition = draft.conditions.some(
      (condition) =>
        !condition.field.trim() ||
        !condition.operator.trim() ||
        !condition.value.trim(),
    );

    if (hasInvalidCondition) {
      nextErrors.conditions = `${FIELD_LABELS.conditions} are required`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (mode: "draft" | "publish") => {
    if (!validateDraft()) {
      return;
    }

    onSubmit(buildRuleFromDraft(rule, draft), mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(15,23,42,0.28)] backdrop-blur-[4px]">
      <button
        type="button"
        aria-label="Close rule configuration panel"
        className="absolute inset-0"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-[620px] flex-col border-l border-[#e5e9f1] bg-white shadow-[-20px_0_60px_-32px_rgba(16,30,61,0.5)]">
        <div className="border-b border-[#edf1f7] px-7 py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold text-[#2a2f39]">
                Rule Configuration
              </h2>
              <p className="mt-1 text-[15px] text-[#8a92a1]">
                Modify compliance rule parameters
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

        <div className="flex-1 space-y-10 overflow-y-auto px-7 py-8">
          <section className="space-y-5">
            <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
              Rule Identity
            </div>

            <div>
              <FieldLabel label="Rule Name" required />
              <input
                type="text"
                value={draft.ruleName}
                onChange={(event) => updateField("ruleName", event.target.value)}
                className={`${fieldClassName} mt-3 h-14`}
              />
              <ErrorText message={errors.ruleName} />
            </div>

            <div>
              <FieldLabel label="Compliance Category" required />
              <div className="relative mt-3">
                <select
                  value={draft.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className={`${fieldClassName} h-14 appearance-none pr-14`}
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#14244a]" />
              </div>
              <ErrorText message={errors.category} />
            </div>

            <div>
              <FieldLabel label="Rule Description" required />
              <textarea
                value={draft.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`${fieldClassName} mt-3 h-[84px] py-4`}
              />
              <ErrorText message={errors.description} />
            </div>
          </section>

          <section className="space-y-5">
            <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
              Trigger Conditions
            </div>

            <div>
              <FieldLabel label="Rule Name" required />
              <div className="mt-3 rounded-[22px] border border-[#b7c5d9] bg-white p-5">
                <div className="space-y-4 rounded-[20px] bg-[#fafbfd] p-4">
                  {draft.conditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_90px_minmax(0,1fr)_44px]"
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
                          className={`${fieldClassName} h-14 appearance-none pr-12`}
                        >
                          <option value="">Select field</option>
                          {FIELD_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <DownOutlined className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#8f97a6]" />
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
                          className={`${fieldClassName} h-14 appearance-none px-4 pr-9 text-center`}
                        >
                          {OPERATOR_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <DownOutlined className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#8f97a6]" />
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
                          className={`${fieldClassName} h-14 pr-[90px]`}
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
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
                              className="h-10 appearance-none rounded-[14px] border border-[#d7deea] bg-[#f7f9fc] px-3 pr-8 text-[15px] text-[#5d6675] outline-none"
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
                        disabled={draft.conditions.length === 1}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#e2e7f0] bg-white text-[16px] text-[#7a8291] transition-colors hover:bg-[#f7f9fc] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addCondition}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#8e98a8] bg-white text-[13px] font-medium text-[#8a92a1] transition-colors hover:bg-[#fafbfd]"
                >
                  Add another condition
                  <PlusOutlined />
                </button>
              </div>
              <ErrorText message={errors.conditions} />
            </div>

            <div>
              <FieldLabel label="System Action" required />
              <div className="relative mt-3">
                <select
                  value={draft.actionType}
                  onChange={(event) => updateField("actionType", event.target.value)}
                  className={`${fieldClassName} h-14 appearance-none pr-14`}
                >
                  {SYSTEM_ACTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#14244a]" />
              </div>
              <ErrorText message={errors.actionType} />
            </div>
          </section>

          <section className="space-y-5">
            <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
              Severity Level
            </div>

            <div>
              <FieldLabel label="Severity Level" required />
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {SEVERITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("severity", option.value)}
                    className={
                      draft.severity === option.value
                        ? "rounded-[18px] border border-[#d5d9e2] bg-[#f1f2f4] px-4 py-6 text-center transition-colors"
                        : "rounded-[18px] border border-[#ccd6e5] bg-white px-4 py-6 text-center transition-colors hover:border-[#aab8cc]"
                    }
                  >
                    <span
                      className={`mx-auto block h-4 w-4 rounded-full ${option.toneClassName}`}
                    />
                    <span className="mt-4 block text-[18px] font-medium text-[#2a2f39]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              <ErrorText message={errors.severity} />
              <p className="mt-3 text-[14px] text-[#8a92a1]">
                Severity determines alert priority in dashboard notifications.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
              Rule Scope
            </div>

            <div>
              <FieldLabel label="Rule Scope" required />
              <div className="relative mt-3">
                <select
                  value={draft.ruleScope}
                  onChange={(event) => updateField("ruleScope", event.target.value)}
                  className={`${fieldClassName} h-14 appearance-none pr-14`}
                >
                  {RULE_SCOPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#14244a]" />
              </div>
              <ErrorText message={errors.ruleScope} />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#edf1f7] px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-14 items-center justify-center rounded-[10px] px-4 text-[13px] font-medium text-[#14244a] transition-colors hover:bg-[#f7f9fc]"
          >
            Cancel
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d7deea] bg-[#f1f4f8] px-4 text-[13px] font-medium text-[#14244a] transition-colors hover:bg-[#e9eef5]"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("publish")}
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
              style={{ color: "#ffffff" }}
            >
              Publish Rule
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
