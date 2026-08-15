"use client";

import { FilePdfOutlined, FileTextOutlined } from "@ant-design/icons";
import type {
  AdminPipelineRow,
  MinerDocumentDetail,
  MinerDocumentStatus,
  MinerEsgItemDetail,
  MinerEsgStatus,
} from "@/src/features/compliance/dashboard/mock";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import {
  StatusBadgePill,
  ScoreMeter,
} from "@/src/features/compliance/dashboard/components/shared/DashboardMetricCard";

export default function AdminMinerPipelineView({
  rows,
  onSelectMiner,
}: {
  rows: AdminPipelineRow[];
  onSelectMiner?: (row: AdminPipelineRow) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
      <div className="overflow-hidden rounded-[24px] border border-[#e5e9f1]">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#fbfcfe] text-[15px] font-medium text-[#353b47]">
                <th className="border-b border-[#e5e9f1] px-5 py-5">Miner ID</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Name / Company</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">State / LGA</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">License status</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Environmental status</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Compliance score</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Assigned reviewer</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Last action date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.minerId}-${index}`}
                  onClick={() => onSelectMiner?.(row)}
                  className={classNames(
                    "text-[15px] text-[#4b5260]",
                    onSelectMiner ? "cursor-pointer hover:bg-[#f4f7fc]" : "",
                    index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]",
                  )}
                >
                  <td className="border-b border-[#edf1f7] px-5 py-6 font-medium text-[#4c5565]">
                    {row.minerId}
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6 text-[#2f3541]">
                    <div className="max-w-[220px] truncate">{row.company}</div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">{row.location}</td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <StatusBadgePill badge={row.licenseStatus} />
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <StatusBadgePill badge={row.environmentalStatus} />
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <ScoreMeter score={row.complianceScore} />
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <div className="max-w-[180px] truncate">{row.reviewer}</div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6 whitespace-nowrap">
                    {row.lastActionDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function MinerDocumentRadioRow({
  document,
  onChange,
}: {
  document: MinerDocumentDetail;
  onChange: (status: MinerDocumentStatus) => void;
}) {
  const options: { key: MinerDocumentStatus; label: string }[] = [
    { key: "verified", label: "Verified" },
    { key: "issues", label: "Issues found" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="rounded-[18px] border border-[#e8ecf4] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[20px] text-[#1ea43b]">
            {document.fileName ? <FilePdfOutlined /> : <FileTextOutlined />}
          </span>
          <div>
            <div className="text-[15px] font-medium text-[#2a2f39]">{document.name}</div>
            {document.fileName ? (
              <div className="mt-1 text-[13px] text-[#7b8392]">{document.fileName}</div>
            ) : null}
            <div className="mt-1 text-[13px] text-[#8a92a1]">Issued: {document.issuedDate}</div>
          </div>
        </div>
        <button
          type="button"
          disabled={!document.fileName}
          onClick={() => showToast("Document preview isn't connected to the backend yet.", "error")}
          className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#dce3ef] px-3 text-[13px] font-medium text-[#5d6675] disabled:cursor-not-allowed disabled:opacity-50"
        >
          View
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[14px] text-[#5d6675]">
        <span>Status:</span>
        {options.map((option) => (
          <label key={option.key} className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={`doc-status-${document.id}`}
              checked={document.status === option.key}
              onChange={() => onChange(option.key)}
              className="h-4 w-4 accent-[#14244a]"
            />
            {option.label}
          </label>
        ))}
      </div>
      {document.status === "verified" && document.verifiedBy ? (
        <div className="mt-3 text-[12px] text-[#8a92a1]">
          Verified by: {document.verifiedBy} on {document.verifiedAt}
        </div>
      ) : null}
    </div>
  );
}

export function MinerEsgReviewRow({
  item,
  onChangeStatus,
  onChangeNotes,
}: {
  item: MinerEsgItemDetail;
  onChangeStatus: (status: MinerEsgStatus) => void;
  onChangeNotes: (notes: string) => void;
}) {
  const options: { key: MinerEsgStatus; label: string }[] = [
    { key: "approved", label: "Approved" },
    { key: "in_progress", label: "In progress" },
    { key: "not_initiated", label: "Not initiated" },
  ];

  return (
    <div className="rounded-[20px] border border-[#e8ecf4] bg-[#fafbfd] p-5">
      <div className="text-[16px] font-medium text-[#2a2f39]">{item.title}</div>
      <div className="mt-3 text-[13px] font-medium text-[#5d6675]">
        Status:
        <div className="mt-2 flex flex-wrap gap-3 text-[14px] text-[#5d6675]">
          {options.map((option) => (
            <label
              key={option.key}
              className={classNames(
                "cursor-pointer rounded-full border px-3 py-2 transition-colors",
                item.status === option.key
                  ? "border-[#14244a] bg-[#14244a] !text-white"
                  : "border-[#dce3ef] bg-white",
              )}
            >
              <input
                type="radio"
                name={`esg-status-${item.key}`}
                checked={item.status === option.key}
                onChange={() => onChangeStatus(option.key)}
                className="mr-2 hidden"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <div className="mt-4 text-[13px] font-medium text-[#5d6675]">Notes</div>
      <textarea
        value={item.notes}
        onChange={(event) => onChangeNotes(event.target.value)}
        placeholder="Type your message here"
        className="mt-2 h-20 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#2a2f39] outline-none placeholder:text-[#a0a7b5]"
      />
      <div className="mt-3 text-[12px] text-[#8a92a1]">
        Updated by: {item.updatedBy} on {item.updatedAt}
      </div>
    </div>
  );
}

