

export type CaseReviewTab =
  | "overview"
  | "sites"
  | "licensing"
  | "environmental-esg"
  | "operational"
  | "export-compliance"
  | "documents"
  | "internal-notes"
  | "timeline"
  | "audit-history";

export const CASE_REVIEW_TABS: { key: CaseReviewTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "sites", label: "Sites" },
  { key: "licensing", label: "Licensing" },
  { key: "environmental-esg", label: "Environmental & ESG" },
  { key: "operational", label: "Operational" },
  { key: "export-compliance", label: "Export Compliance" },
  { key: "documents", label: "Documents" },
  { key: "internal-notes", label: "Internal Notes" },
  { key: "timeline", label: "Timeline" },
  { key: "audit-history", label: "Audit History" },
];

