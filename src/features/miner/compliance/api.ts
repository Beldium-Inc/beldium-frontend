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
  expiry_date: string | null;
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

export async function getMinerComplianceDetail(minerId: string) {
  const res = await authApi.get<ComplianceDetailResponse>(`/compliance/miners/${minerId}/detail/`);
  return res.data;
}

export type CreateMinerDocumentResponse = {
  status: string;
  data: MinerDocument;
  message: string | null;
};

export async function createMinerDocument(params: {
  documentType: string;
  file: File;
  issuedDate?: string | null;
  expiryDate?: string | null;
}) {
  const formData = new FormData();
  formData.append("document_type", params.documentType);
  formData.append("file", params.file);
  if (params.issuedDate) formData.append("issued_date", params.issuedDate);
  if (params.expiryDate) formData.append("expiry_date", params.expiryDate);

  const res = await authApi.post<CreateMinerDocumentResponse>(
    "/compliance/miners/documents/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}
