import type { ReactNode } from "react";
import type { StatusBadge, TrendDirection } from "@/src/features/compliance/dashboard/mock";
import type { ComplianceReviewDetail } from "@/src/features/compliance/dashboard/api";

export type DashboardPersona = "admin" | "compliance";

/**
 * Regulated sectors a compliance officer can switch between.
 * Only "miners" has compliance models on the backend today; the others are
 * declared here so the switcher reflects the intended product surface, and
 * each carries `available` so the UI can show an honest empty state instead
 * of rendering miner data under another sector's label.
 */
export type RegulatedSector = "miners" | "logistics" | "marketplace";

export const REGULATED_SECTORS: {
  value: RegulatedSector;
  label: string;
  available: boolean;
}[] = [
  { value: "miners", label: "Miners", available: true },
  { value: "logistics", label: "Logistics & Warehousing", available: false },
  { value: "marketplace", label: "Marketplace", available: false },
];

export function parseRegulatedSector(value: string | null): RegulatedSector {
  return REGULATED_SECTORS.some((sector) => sector.value === value)
    ? (value as RegulatedSector)
    : "miners";
}
export type ComplianceView =
  | "dashboard"
  | "reviews"
  | "notifications"
  | "settings"
  | "organization-profile"
  | "regulatory-scope"
  | "teams-roles"
  | "verification-rules-thresholds"
  | "documents-data-controls"
  | "notifications-alerts"
  | "security-access-controls"
  | "audits-legal-records"
  | "profile"
  | "compliance-profile"
  | "miner-pipeline"
  | "partner-directory"
  | "regulatory-readiness"
  | "regulatory-alerts";

export type NavItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  showDot?: boolean;
};

export type MetricCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  iconTone: "blue" | "orange" | "mint" | "rose";
  trendText?: string;
  trendDirection?: TrendDirection;
  note?: string;
  featured?: boolean;
  progress?: number;
  showAction?: boolean;
  footer?: ReactNode;
};

export type AdminReviewRow = {
  id: string;
  minerUuid: string;
  minerId: string;
  company: string;
  location: string;
  reviewStatus: StatusBadge;
  riskLevel: StatusBadge;
  complianceScore: number;
  reviewer: string;
  lastActionDate: string;
  /** Raw ISO timestamp for `MinerComplianceReview.created_at` (compliance/serializers.py MinerComplianceReviewListSerializer). Used as "Submitted". */
  createdAt: string;
  /** Raw ISO timestamp for `MinerComplianceReview.claimed_at`, null until claimed. */
  claimedAt: string | null;
};

export type ComplianceQueueRow = {
  id: string;
  minerUuid: string;
  minerId: string;
  company: string;
  location: string;
  rawStatus: string;
  statusBadge: StatusBadge;
  createdAt: string;
  waitTime: string;
  waitMinutes: number;
  waitTone?: "default" | "warning";
  highlighted?: boolean;
};

export type ComplianceActiveTaskCard = {
  id: string;
  minerUuid: string;
  minerId: string;
  company: string;
  location: string;
  rawStatus: string;
  priority: StatusBadge;
  progress: number;
  cta: string;
};

export type ComplianceReviewSelection = {
  reviewId: string;
  minerId?: string | null;
  minerCode?: string;
  company?: string;
  location?: string;
  minerName?: string | null;
  createdAt?: string;
  claimRequired?: boolean;
};

export type ReviewActionType =
  | "approve"
  | "reject"
  | "start_review"
  | "claim"
  | "open_detail";

export type ComplianceMinerDetailState = {
  selection: ComplianceReviewSelection;
  reviewDetail?: ComplianceReviewDetail | null;
};

export type EscalationWatchlistRow = {
  id: string;
  reviewId: string | null;
  minerId: string;
  company: string;
  level: string;
  note: string;
  escalatedAt: string;
};

export type TrendPoint = { label: string; score: number };

export type OrganisationComplianceRow = {
  id: string;
  name: string;
  score: number;
  riskTone: "green" | "amber" | "red";
};

export type ApplicationInFlightRow = {
  id: string;
  reference: string;
  type: string;
  status: StatusBadge;
  dueInDays: number | null;
};

export type ExpiringLicenceRow = {
  id: string;
  minerCode: string;
  licenceNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
};

export type ReviewDocumentKind = "pdf" | "image" | "file";

export type ReviewDocumentFile = {
  id: string;
  name: string;
  type: ReviewDocumentKind;
  viewUrl: string;
  downloadUrl: string;
};

