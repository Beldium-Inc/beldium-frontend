export type SiteSubTab =
  | "corporate"
  | "licence"
  | "site_gps"
  | "ownership"
  | "environmental"
  | "safety"
  | "equipment"
  | "production"
  | "sampling"
  | "inspection";

export type CaseReviewTab = SiteSubTab | "documents";

export const CASE_REVIEW_TABS: { key: CaseReviewTab; label: string }[] = [
  { key: "corporate", label: "Corporate" },
  { key: "licence", label: "Licence" },
  { key: "site_gps", label: "Site & GPS" },
  { key: "ownership", label: "Ownership" },
  { key: "environmental", label: "Environmental" },
  { key: "safety", label: "Safety" },
  { key: "equipment", label: "Equipment" },
  { key: "production", label: "Production" },
  { key: "sampling", label: "Sampling & Quality" },
  { key: "inspection", label: "Inspection" },
  { key: "documents", label: "Documents" },
];
