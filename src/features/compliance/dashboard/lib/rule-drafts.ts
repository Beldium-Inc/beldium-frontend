import type { ComplianceRuleRow, StatusBadge } from "@/src/features/compliance/dashboard/mock";

export type CreateRuleDraft = {
  ruleName: string;
  category: string;
  description: string;
  conditions: CreateRuleCondition[];
  actionType: string;
  severity: string;
  ruleScope: string;
  reviewNotes: string;
  notifyOfficer: boolean;
  createAuditLog: boolean;
};


export type CreateRuleCondition = {
  id: string;
  field: string;
  operator: string;
  value: string;
  unit: string;
};


export type CreateRuleDraftField = keyof Omit<CreateRuleDraft, "conditions">;
export type CreateRuleValidationField = CreateRuleDraftField | "conditions";

export const CREATE_RULE_STEP_COPY = [
  "Define compliance evaluation criteria",
  "Define compliance evaluation criteria",
  "Define compliance evaluation criteria",
] as const;

export const CREATE_RULE_CATEGORY_OPTIONS = [
  "Environmental",
  "ESG",
  "Community",
  "Export",
  "Safety",
] as const;

export const CREATE_RULE_TRIGGER_OPTIONS = [
  "Production Volume",
  "Permit Expiry Date",
  "EIA Submission Status",
  "ESG Reporting Deadline",
  "Worker Safety Training Age",
] as const;

export const CREATE_RULE_OPERATOR_OPTIONS = [
  ">",
  "<",
  "=",
  "is missing",
  "expires within",
] as const;

export const CREATE_RULE_UNIT_OPTIONS = [
  "Tons",
  "Days",
  "Percent",
  "Months",
  "Submission",
] as const;

export const CREATE_RULE_ACTION_OPTIONS = [
  "Auto flag miner",
  "High Risk Flag",
  "Issue Warning",
  "Escalate to Compliance Officer",
  "Block submission and notify team",
] as const;

export const CREATE_RULE_SEVERITY_OPTIONS = [
  "Low",
  "Medium",
  "High",
] as const;

export const CREATE_RULE_SCOPE_OPTIONS = [
  "All Jurisdiction",
  "Federal Only",
  "State Level",
  "Pilot Phase",
] as const;

export function formatCreateRuleCondition(condition: CreateRuleCondition) {
  return [condition.field, condition.operator, condition.value, condition.unit]
    .filter(Boolean)
    .join(" ");
}

export function createDraftFromRuleRow(rule: ComplianceRuleRow): CreateRuleDraft {
  return {
    ruleName: rule.name,
    category: rule.category,
    description: rule.description,
    conditions:
      rule.conditions.length > 0
        ? rule.conditions.map((condition, index) => ({
            ...condition,
            id: `${rule.id}-condition-${index + 1}`,
          }))
        : [
            {
              id: `${rule.id}-condition-1`,
              field: "",
              operator: ">",
              value: "",
              unit: "Tons",
            },
          ],
    actionType: rule.action,
    severity: rule.severityLabel,
    ruleScope: rule.scope,
    reviewNotes: "",
    notifyOfficer: true,
    createAuditLog: true,
  };
}

export function createRuleRowFromDraft(
  draft: CreateRuleDraft,
  options?: {
    id?: string;
    version?: string;
    status?: StatusBadge;
  },
): ComplianceRuleRow {
  return {
    id: options?.id ?? `mock-rule-${Date.now()}`,
    name: draft.ruleName,
    version: options?.version ?? "v1",
    category: draft.category,
    description: draft.description,
    triggerCondition: draft.conditions
      .map((condition) => formatCreateRuleCondition(condition))
      .filter(Boolean)
      .join(" • "),
    conditions: draft.conditions.map((condition, index) => ({
      ...condition,
      id: `${options?.id ?? "mock-rule"}-condition-${index + 1}`,
    })),
    action: draft.actionType,
    severityLabel:
      draft.severity === "High" || draft.severity === "Medium"
        ? draft.severity
        : "Low",
    scope: draft.ruleScope,
    status:
      options?.status ?? {
        label: "Draft",
        tone: "cyan",
      },
  };
}

