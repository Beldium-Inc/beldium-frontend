"use client";

import { Fragment, useMemo, useRef, useState } from "react";
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
  ExpandOutlined,
  UndoOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getUser } from "@/src/features/miner/settings/api";
import { downloadFile, getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";
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

// Rank so, when a required type has more than one upload, the most
// "complete" one wins the single row shown for it - approved beats
// pending beats expired/action-required.
const STATUS_RANK: Record<Row["status"], number> = {
  approved: 3,
  completed: 3,
  pending_review: 2,
  expired: 1,
  action_required: 0,
};

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
    expiry: d.expiry_date,
    status:
      d.expiry_date && dayjs(d.expiry_date).isBefore(dayjs())
        ? "expired"
        : d.status?.toLowerCase() === "verified"
          ? "completed"
          : "pending_review",
    fileUrl: d.file,
  }));

  // Only the fixed set of document types the compliance requirement list
  // actually asks for - drop anything else the miner has on file (junk
  // test uploads, one-off document types, duplicates of the same type).
  const candidates = [...fromLicenses, ...fromDocuments].filter((r) =>
    REQUIRED_DOCUMENT_TYPES.some((type) => type.toLowerCase() === r.documentType.toLowerCase()),
  );

  return REQUIRED_DOCUMENT_TYPES.map((type) => {
    const matches = candidates.filter((r) => r.documentType.toLowerCase() === type.toLowerCase());
    if (matches.length === 0) {
      return { key: `missing-${type}`, documentType: type, uploaded: null, expiry: null, status: "action_required", fileUrl: null };
    }
    return matches.reduce((best, r) => (STATUS_RANK[r.status] > STATUS_RANK[best.status] ? r : best));
  });
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="w-full sm:w-auto" onClick={() => setRequirementsOpen(true)}>View Requirements</Button>
          <Button className="w-full sm:w-auto !h-12 !rounded-xl !px-8 !text-base" type="primary" icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>
            Upload Documents
          </Button>
        </div>
      </div>

      {!loading && hasExpired && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <WarningOutlined className="text-[#960805]" />
            <div>
              <div className="text-sm font-semibold text-[#C00F0C]">Expired Documents</div>
              <div className="text-xs text-[#960805]">One or more documents have expired and need updating.</div>
            </div>
          </div>
          <Button className="w-full sm:w-auto !bg-[#960805]" type="primary" onClick={() => setUploadOpen(true)}>Upload Documents</Button>
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
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
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
                    <td className="px-6 float-right py-4">
                      {row.status === "expired" || row.status === "action_required" ? (
                        <Button danger className="!bg-[#960805] !text-white !h-10 !border-none !text-sm !rounded-lg" size="small" onClick={() => setUploadOpen(true)}>Upload Documents</Button>
                      ) : (
                        <Button className="  !h-10 !border-2 !text-sm !rounded-lg" size="small" onClick={() => setViewRow(row)}>View</Button>
                      )}
                    </td>
                  </tr>
                  {(row.status === "expired" || row.status === "action_required") && (
                    <tr className="bg-red-50/50">
                      <td colSpan={5} className="px-6 py-3 text-xs text-[#C00F0C] border-b border-red-100">
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
          </div>
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
  const [expiryDate, setExpiryDate] = useState<string>("");
  const queryClient = useQueryClient();

  const reset = () => {
    setDocumentType(undefined);
    setFile(null);
    setIssuedDate("");
    setExpiryDate("");
    setHasExpiry(true);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!documentType || !file) throw new Error("Document type and file are required");
      if (hasExpiry && !expiryDate) throw new Error("Expiry date is required for this document");
      return createMinerDocument({
        documentType,
        file,
        issuedDate: issuedDate || null,
        expiryDate: hasExpiry ? expiryDate || null : null,
      });
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
    if (hasExpiry && !expiryDate) {
      showToast("Enter an expiry date, or turn off \"Document has expiry date\".", "error");
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
            <Input type="date" placeholder="dd/mm/yyyy" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
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

function isPdfUrl(url: string) {
  return /\.pdf($|\?)/i.test(url);
}

function DocumentDetailModal({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Reset zoom/pan whenever a different document is opened, so leftover
  // state from the previous preview doesn't carry over.
  const rowKey = row?.key;
  const lastKeyRef = useRef<string | undefined>(undefined);
  if (rowKey !== lastKeyRef.current) {
    lastKeyRef.current = rowKey;
    if (zoom !== 100) setZoom(100);
    if (pan.x !== 0 || pan.y !== 0) setPan({ x: 0, y: 0 });
    if (imgFailed) setImgFailed(false);
  }

  if (!row) return null;

  const isPdf = row.fileUrl ? isPdfUrl(row.fileUrl) : false;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 100) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pan.x, originY: pan.y };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({ x: dragRef.current.originX + dx, y: dragRef.current.originY + dy });
  };
  const handlePointerUp = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const handleDownload = async () => {
    if (!row.fileUrl || downloading) return;
    try {
      setDownloading(true);
      await downloadFile(row.fileUrl, row.documentType);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Couldn't download this file."), "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={!!row}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      title="Document Details"
      width={1180}
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 lg:h-[78vh]">
        <div className="lg:w-64 flex-shrink-0 px-6 pt-4 pb-4 lg:pb-6 space-y-6">
          <div>
            <div className="text-xs text-gray-400 mb-1">Document Type</div>
            <div className="text-lg font-semibold text-gray-900">{row.documentType}</div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2">Status</div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_STYLES[row.status]}`}>
              {STATUS_LABELS[row.status]}
            </span>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Upload Date</div>
            <div className="text-sm font-medium text-gray-900">
              {row.uploaded ? dayjs(row.uploaded).format("MMM DD, YYYY") : "--"}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Expiry Date</div>
            <div className="text-sm font-medium text-gray-900">
              {row.expiry ? dayjs(row.expiry).format("MMM DD, YYYY") : "No expiry"}
            </div>
          </div>

          {row.fileUrl && (
            <div className="flex flex-col gap-2 pt-2">
              <Button icon={<DownloadOutlined />} onClick={handleDownload} loading={downloading} block>
                Download
              </Button>
              <Button icon={<ExportOutlined />} href={row.fileUrl} target="_blank" type="text" block>
                Open in new tab
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
            <div className="text-sm font-medium text-gray-700">Document Preview</div>
            {!isPdf && row.fileUrl && !imgFailed && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  disabled={zoom <= 50}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Zoom out"
                >
                  <ZoomOutOutlined className="text-sm" />
                </button>
                <span className="text-xs text-gray-500 w-12 text-center tabular-nums">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(300, z + 25))}
                  disabled={zoom >= 300}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Zoom in"
                >
                  <ZoomInOutlined className="text-sm" />
                </button>
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    setZoom(100);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="flex h-8 items-center gap-1.5 px-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-600"
                >
                  <UndoOutlined className="text-xs" /> Reset
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(300)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  aria-label="Fill view"
                >
                  <ExpandOutlined className="text-sm" />
                </button>
              </div>
            )}
          </div>

          <div
            className={`relative flex-1 min-h-[420px] overflow-hidden ${
              zoom > 100 ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {!row.fileUrl ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm text-gray-400">No file uploaded</span>
              </div>
            ) : isPdf ? (
              <iframe title={row.documentType} src={row.fileUrl} className="w-full h-full border-0" />
            ) : imgFailed ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
                <span className="text-sm text-gray-500">
                  This file couldn&apos;t be previewed here - it may have expired or isn&apos;t an image/PDF.
                </span>
                <Button icon={<ExportOutlined />} href={row.fileUrl} target="_blank">
                  Open in new tab instead
                </Button>
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.fileUrl}
                  alt={row.documentType}
                  draggable={false}
                  onError={() => setImgFailed(true)}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                    transformOrigin: "center center",
                  }}
                  className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-150 ease-out shadow-sm rounded"
                />
              </div>
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
