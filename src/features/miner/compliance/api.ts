import { authApi } from "@/src/lib/axiosInstance";

export type MinerLicense = {
  id: string;
  license_type: string;
  license_number: string;
  issuing_authority: string;
  expiry_date: string | null;
  document: string | null;
  verification_status: "pending" | "verified" | "issues_found" | "rejected" | string;
  notes: string;
};

export type MinerDocument = {
  id: string;
  document_type: string;
  file: string | null;
  issued_date: string | null;
  status: "pending" | "verified" | "issues_found" | "rejected" | string;
  notes: string;
};

export type MinerComplianceDetail = {
  licenses: MinerLicense[];
  documents: MinerDocument[];
};

export type ComplianceDetailResponse = {
  status: string;
  data: MinerComplianceDetail;
  message: string | null;
};

// GET-only. The backend has no create/upload endpoint for miner
// licenses/documents yet, only admin-side verify actions.
export async function getMinerComplianceDetail(minerId: string) {
  const res = await authApi.get<ComplianceDetailResponse>(`/compliance/miners/${minerId}/detail/`);
  return res.data;
}
