import { getComplianceMinerDetail } from "@/src/features/compliance/dashboard/api";
import type { MinerProfileListItem } from "./api";

// Reuses the existing /miner-detail/[minerId] proxy route (src/app/miner-detail/[minerId]/route.ts)
// via getComplianceMinerDetail, per compliance/views.py MinerComplianceDetailView + MinerComplianceDetailSerializer.
// Do not create a second proxy route for this data.

export type MinerLicense = {
  id: string;
  license_type: string;
  license_number: string;
  issuing_authority: string;
  expiry_date: string | null;
  document: string | null;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
};

export type MinerDocument = {
  id: string;
  document_type: string;
  file: string | null;
  issued_date: string | null;
  status: string;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
};

export type MinerComplianceReview = {
  id: string;
  status: string;
  risk_level: string | null;
  compliance_score: number | null;
  notes: string | null;
  assigned_to: string | null;
  claimed_at: string | null;
  reviewed_at: string | null;
};

export type MinerEsgReview = {
  id: string;
  status: string;
  category: string;
  notes: string | null;
  reviewed_by: string | null;
  updated_at: string;
};

export type MinerComplianceDetail = {
  miner: MinerProfileListItem;
  compliance_review: MinerComplianceReview | null;
  licenses: MinerLicense[];
  documents: MinerDocument[];
  esg_reviews: MinerEsgReview[];
  support_requests: unknown[];
  activity_logs: unknown[];
};

export type MinerComplianceDetailResponse = {
  status: string;
  message: string | null;
  data: MinerComplianceDetail;
};

export async function getMinerComplianceDetail(minerId: string) {
  const data = await getComplianceMinerDetail(minerId);
  return data as unknown as MinerComplianceDetailResponse;
}
