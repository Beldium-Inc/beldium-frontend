import type { ReactNode } from "react";
import type { StatusBadge, TrendDirection } from "@/src/features/compliance/dashboard/mock";
import type { ComplianceReviewDetail } from "@/src/features/compliance/dashboard/api";

export type DashboardPersona = "admin" | "compliance";
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

export type ReviewDocumentKind = "pdf" | "image" | "file";

export type ReviewDocumentFile = {
  id: string;
  name: string;
  type: ReviewDocumentKind;
  viewUrl: string;
  downloadUrl: string;
};

