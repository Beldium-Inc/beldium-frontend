"use client";

import { Fragment, useMemo, useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button, Modal, Select, Input, Upload, Switch, Skeleton, Drawer } from "antd";
import type { UploadFile } from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  UploadOutlined,
  CloseOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getUser } from "@/src/features/miner/settings/api";
import { createMinerDocument, getMinerComplianceDetail, MinerDocument, MinerLicense } from "@/src/features/miner/compliance/api";
import { showToast } from "@/src/store/toast.store";

// Fixed set of document types the design expects to see a row for, even
// when the miner hasn't uploaded/been assigned one yet (shown as "Action required").
const REQUIRED_DOCUMENT_TYPES = [
  "Mining License",
  "Environmental Permit",
  "Government-issued ID",
  "Environmental & Compliance Documents",
  "Tax Clearance",
];

type Row = {
  key: string;
  documentType: string;
  uploaded: string | null;
  expiry: string | null;
  status: "approved" | "pending_review" | "expired" | "completed" | "action_required";
  fileUrl: string | null;
};

function statusFromBackend(raw: string, expiry: string | null): Row["status"] {
  if (expiry && dayjs(expiry).isBefore(dayjs())) return "expired";
  const v = (raw || "").toLowerCase();
  if (v === "verified") return "approved";
  return "pending_review";
}

function buildRows(licenses: MinerLicense[], documents: MinerDocument[]): Row[] {
  const fromLicenses: Row[] = licenses.map((l) => ({
    key: l.id,
    documentType: l.license_type,
    uploaded: null,
    expiry: l.expiry_date,
    status: statusFromBackend(l.verification_status, l.expiry_date),
    fileUrl: l.document,
  }));

  const fromDocuments: Row[] = documents.map((d) => ({
    key: d.id,
    documentType: d.document_type,
    uploaded: d.issued_date,
    expiry: null,
    status: d.status?.toLowerCase() === "verified" ? "completed" : "pending_review",
    fileUrl: d.file,
  }));

  const rows = [...fromLicenses, ...fromDocuments];

  // Fill in any of the standard required types that have no matching row yet.
  for (const type of REQUIRED_DOCUMENT_TYPES) {
    const has = rows.some((r) => r.documentType.toLowerCase() === type.toLowerCase());
    if (!has) {
      rows.push({ key: `missing-${type}`, documentType: type, uploaded: null, expiry: null, status: "action_required", fileUrl: null });
    }
  }

  return rows;
}

const STATUS_STYLES: Record<Row["status"], string> = {
  approved: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  pending_review: "bg-orange-100 text-orange-700",
  expired: "bg-red-100 text-red-700",
  action_required: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<Row["status"], string> = {
  approved: "Approved",
  completed: "Completed",
  pending_review: "Pending review",
  expired: "Expired",
  action_required: "Action required",
};

export default function CompliancePage() {
  const { data: userData, isLoading: userLoading } = useQuery({ queryKey: ["userProfile"], queryFn: getUser });
  const minerId = userData?.data?.profile?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["complianceDetail", minerId],
    queryFn: () => getMinerComplianceDetail(minerId as string),
    enabled: !!minerId,
  });

  const rows = useMemo(
    () => buildRows(data?.data?.licenses || [], data?.data?.documents || []),
    [data]
  );

  const completedCount = rows.filter((r) => r.status === "approved" || r.status === "completed").length;
  const completionPct = rows.length ? Math.round((completedCount / rows.length) * 100) : 0;
  const hasExpired = rows.some((r) => r.status === "expired");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [viewRow, setViewRow] = useState<Row | null>(null);

  const loading = userLoading || isLoading;

  return (
    <div className="space-y-6 px-4 md:px-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compliance Documents</h1>
          <p className="text-sm md:text-base text-gray-500">Upload and manage your licenses and certifications.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setRequirementsOpen(true)}>View Requirements</Button>
          <Button className="!h-12 !rounded-xl !px-8 !text-base" type="primary" icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>
            Upload Documents
          </Button>
        </div>
      </div>

      {!loading && hasExpired && (
        <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <WarningOutlined className="text-red-500" />
            <div>
              <div className="text-sm font-semibold text-red-600">Expired Documents</div>
              <div className="text-xs text-red-500">One or more documents have expired and need updating.</div>
            </div>
          </div>
          <Button danger type="primary" onClick={() => setUploadOpen(true)}>Upload Documents</Button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {loading ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Compliance Completion</span>
              <span className="text-lg font-bold text-gray-900">{completionPct}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {completedCount} of {rows.length} required documents completed
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6"><Skeleton active paragraph={{ rows: 5 }} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Document Type</th>
                <th className="px-6 py-3 font-medium">Uploaded</th>
                <th className="px-6 py-3 font-medium">Expiry</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.key}>
                  <tr className="border-b border-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.documentType}</td>
                    <td className="px-6 py-4 text-gray-600">{row.uploaded ? dayjs(row.uploaded).format("MMM DD, YYYY") : "--"}</td>
                    <td className="px-6 py-4 text-gray-600">{row.expiry ? dayjs(row.expiry).format("MMM DD, YYYY") : "--"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[row.status]}`}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {row.status === "expired" || row.status === "action_required" ? (
                        <Button danger size="small" onClick={() => setUploadOpen(true)}>Upload Documents</Button>
                      ) : (
                        <Button size="small" onClick={() => setViewRow(row)}>View</Button>
                      )}
                    </td>
                  </tr>
                  {(row.status === "expired" || row.status === "action_required") && (
                    <tr className="bg-red-50/50">
                      <td colSpan={5} className="px-6 py-3 text-xs text-red-600 border-b border-red-100">
                        <WarningOutlined className="mr-1.5" />
                        {row.status === "expired"
                          ? "This document has expired. Please upload a valid version."
                          : "This document is required to continue operations on Beldium."}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UploadDocumentModal open={uploadOpen} onClose={() => setUploadOpen(false)} minerId={minerId} />
      <DocumentDetailModal row={viewRow} onClose={() => setViewRow(null)} />
      <RequirementsDrawer open={requirementsOpen} onClose={() => setRequirementsOpen(false)} />
    </div>
  );
}

function UploadDocumentModal({ open, onClose, minerId }: { open: boolean; onClose: () => void; minerId?: string }) {
  const [hasExpiry, setHasExpiry] = useState(true);
  const [documentType, setDocumentType] = useState<string | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [issuedDate, setIssuedDate] = useState<string>("");
  const queryClient = useQueryClient();

  const reset = () => {
    setDocumentType(undefined);
    setFile(null);
    setIssuedDate("");
    setHasExpiry(true);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!documentType || !file) throw new Error("Document type and file are required");
      return createMinerDocument({ documentType, file, issuedDate: issuedDate || null });
    },
    onSuccess: () => {
      showToast("Document uploaded successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["complianceDetail", minerId] });
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to upload document. Please try again.";
      showToast(message, "error");
    },
  });

  const submit = () => {
    if (!documentType) {
      showToast("Select a document type.", "error");
      return;
    }
    if (!file) {
      showToast("Choose a file to upload.", "error");
      return;
    }
    mutate();
  };

  return (
    <Modal open={open} onCancel={onClose} width={700} footer={null} closeIcon={<CloseOutlined />} title="Upload Document">
      <div className="space-y-5 mt-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">Document Type *</label>
          <Select
            className="w-full"
            placeholder="Select the document type"
            value={documentType}
            onChange={setDocumentType}
            options={REQUIRED_DOCUMENT_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">File Upload *</label>
          <Upload.Dragger
            beforeUpload={(f) => {
              setFile(f);
              return false;
            }}
            onRemove={() => setFile(null)}
            fileList={file ? ([{ uid: "1", name: file.name, status: "done" }] as UploadFile[]) : []}
            maxCount={1}
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="text-sm">Choose file or drag and drop it here</p>
            <p className="text-xs text-gray-400">JPEG, PNG, and PDF formats, up to 20 MB.</p>
          </Upload.Dragger>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1.5">Issue Date *</label>
          <Input type="date" placeholder="dd/mm/yyyy" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Document has expiry date</span>
          <Switch checked={hasExpiry} onChange={setHasExpiry} />
        </div>
        {hasExpiry && (
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Expiry Date *</label>
            <Input type="date" placeholder="dd/mm/yyyy" disabled title="Expiry tracking isn't supported for this document type yet" />
          </div>
        )}
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
          All documents will be reviewed by our compliance team.
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={isPending} onClick={submit}>Upload</Button>
        </div>
      </div>
    </Modal>
  );
}

function DocumentDetailModal({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const [zoom, setZoom] = useState(100);

  if (!row) return null;

  return (
    <Modal open={!!row} onCancel={onClose} footer={null} closeIcon={<CloseOutlined />} title="Document Details" width={700}>
      <div className="mt-4 flex items-start justify-between gap-3 mb-6">
        <div>
          <div className="text-xs text-gray-400">Document Type</div>
          <div className="text-base font-semibold text-gray-900">{row.documentType}</div>
        </div>
        {row.fileUrl && (
          <Button
            icon={<DownloadOutlined />}
            href={row.fileUrl}
            target="_blank"
            className="!bg-[#14244a] !text-white !border-none hover:!bg-[#1c3363]"
          >
            Download
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[row.status]}`}>
              {STATUS_LABELS[row.status]}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-400">Upload Date</div>
            <div className="text-sm text-gray-900">{row.uploaded ? dayjs(row.uploaded).format("MMM DD, YYYY") : "--"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Expiry</div>
            <div className="text-sm text-gray-900">{row.expiry ? dayjs(row.expiry).format("MMM DD, YYYY") : "No expiry"}</div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400">Document Preview</div>
            <div className="flex items-center gap-2 text-gray-500">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(200, z + 25))}
                className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
              >
                <ZoomInOutlined className="text-xs" />
              </button>
              <span className="text-xs text-gray-500 w-9 text-center">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 25))}
                className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
              >
                <ZoomOutOutlined className="text-xs" />
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 h-64 flex items-center justify-center overflow-auto">
            {row.fileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.fileUrl}
                alt={row.documentType}
                style={{ width: `${zoom}%` }}
                className="max-w-none object-contain transition-[width]"
              />
            ) : (
              <span className="text-xs text-gray-400">No file uploaded</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function RequirementsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer title="Document Requirements" open={open} onClose={onClose} width={420}>
      <p className="text-sm text-gray-500 mb-4">
        The backend has no dedicated &quot;requirements&quot; endpoint yet, this list reflects the standard
        documents expected on this page.
      </p>
      <ul className="space-y-3">
        {REQUIRED_DOCUMENT_TYPES.map((t) => (
          <li key={t} className="text-sm text-gray-800 border-b border-gray-50 pb-3">{t}</li>
        ))}
      </ul>
    </Drawer>
  );
}
