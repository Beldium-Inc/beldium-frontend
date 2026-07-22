"use client";

import { useState } from "react";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FlagOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { AdminPipelineRow } from "@/src/features/compliance/dashboard/mock";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { ReviewInfoTile } from "@/src/features/compliance/dashboard/components/shared/ReviewTiles";
import {
  MinerDocumentRadioRow,
  MinerEsgReviewRow,
} from "@/src/features/compliance/dashboard/components/admin/AdminMinerPipelineView";

export default function AdminMinerDetailView({
  row,
  onBack,
  onEscalate,
  onRequestDocuments,
}: {
  row: AdminPipelineRow;
  onBack: () => void;
  onEscalate: () => void;
  onRequestDocuments: () => void;
}) {
  const [minerStatus, setMinerStatus] = useState(row.detail.minerStatus);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [documents, setDocuments] = useState(row.detail.documents);
  const [esgItems, setEsgItems] = useState(row.detail.esgItems);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-[14px] text-[#7b8392]">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-[#4e5665] hover:text-[#14244a]"
        >
          Dashboard
        </button>
        <ArrowRightOutlined className="text-[12px]" />
        <span className="font-semibold text-[#2a2f39]">Miner Detail</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[#e8ecf4] bg-white p-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-semibold text-white"
              style={{ backgroundColor: row.detail.logoColor }}
            >
              {row.detail.logoInitials}
            </div>
            <div className="mt-4 text-[20px] font-semibold text-[#2a2f39]">{row.company}</div>
            <div className="text-[14px] text-[#8a92a1]">Miner&apos;s ID: {row.minerId}</div>

            <div className="mt-4 flex items-center justify-between text-[14px] text-[#5d6675]">
              <span className="inline-flex items-center gap-1.5 text-[#8a92a1]">
                <EnvironmentOutlined /> Location
              </span>
              <span className="font-medium text-[#2a2f39]">{row.location}</span>
            </div>

            <div className="mt-4 flex h-[140px] items-center justify-center rounded-[16px] bg-[#eef1f6] text-[#8a92a1]">
              <EnvironmentOutlined className="text-[28px]" />
            </div>

            <div className="mt-4 space-y-3 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[#8a92a1]">Monthly output range</span>
                <span className="font-medium text-[#2a2f39]">{row.detail.monthlyOutputRange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[#8a92a1]">Operation type</span>
                <span className="font-medium text-[#2a2f39]">{row.detail.operationType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[#8a92a1]">Miner status</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStatusMenuOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[#dce3ef] bg-white px-3 py-1.5 text-[13px] font-medium text-[#2a2f39]"
                  >
                    {minerStatus}
                    <DownOutlined className="text-[10px]" />
                  </button>
                  {statusMenuOpen ? (
                    <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-[12px] border border-[#e8ecf4] bg-white shadow-[0_18px_36px_-24px_rgba(16,30,61,0.4)]">
                      {(["Under review", "Verified"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setMinerStatus(option);
                            setStatusMenuOpen(false);
                          }}
                          className={classNames(
                            "block w-full px-4 py-2.5 text-left text-[13px]",
                            option === minerStatus
                              ? "bg-[#f4f7fc] font-medium text-[#14244a]"
                              : "text-[#5d6675] hover:bg-[#fafbfd]",
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[24px] border border-[#e8ecf4] bg-white p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#eef2fb] px-4 py-2 text-[13px] font-medium text-[#1d5de2]">
              <IdcardOutlined /> Licensing &amp; Regulatory Status
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewInfoTile icon={<FileTextOutlined />} label="License type" value={row.detail.licenseType} />
              <ReviewInfoTile icon={<IdcardOutlined />} label="License number" value={row.detail.licenseNumber} />
              <ReviewInfoTile icon={<SafetyCertificateOutlined />} label="Issuing authority" value={row.detail.issuingAuthority} />
              <ReviewInfoTile icon={<CalendarOutlined />} label="Expiry/Validity" value={row.detail.licenseExpiry} />
            </div>
          </section>

          <section className="rounded-[24px] border border-[#e8ecf4] bg-white p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#eef2fb] px-4 py-2 text-[13px] font-medium text-[#1d5de2]">
              <FolderOpenOutlined /> Uploaded Documents
            </div>
            <div className="space-y-3">
              {documents.map((document) => (
                <MinerDocumentRadioRow
                  key={document.id}
                  document={document}
                  onChange={(status) =>
                    setDocuments((prev) =>
                      prev.map((item) => (item.id === document.id ? { ...item, status } : item)),
                    )
                  }
                />
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#e8ecf4] bg-white p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e9f9ee] px-4 py-2 text-[13px] font-medium text-[#1ea43b]">
              <SafetyOutlined /> Environmental &amp; ESG Review
            </div>
            <div className="space-y-4">
              {esgItems.map((item) => (
                <MinerEsgReviewRow
                  key={item.key}
                  item={item}
                  onChangeStatus={(status) =>
                    setEsgItems((prev) =>
                      prev.map((entry) => (entry.key === item.key ? { ...entry, status } : entry)),
                    )
                  }
                  onChangeNotes={(notes) =>
                    setEsgItems((prev) =>
                      prev.map((entry) => (entry.key === item.key ? { ...entry, notes } : entry)),
                    )
                  }
                />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onRequestDocuments}
            style={primaryActionStyle}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#14244a] px-4 text-[14px] font-semibold text-white"
          >
            Request Additional Documents
          </button>
          <button
            type="button"
            onClick={() => showToast("Scheduling isn't connected to the backend yet.", "error")}
            style={{ color: "#2a2f39" }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#dce3ef] bg-white px-4 text-[14px] font-medium text-[#2a2f39]"
          >
            Schedule Verification Call
          </button>
          <button
            type="button"
            onClick={onEscalate}
            style={{ color: "#ef2f32" }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#f5c2c2] bg-white px-4 text-[14px] font-semibold text-[#ef2f32]"
          >
            <FlagOutlined /> Escalate (Red flag)
          </button>

          <div className="!mt-6 rounded-[24px] border border-[#e8ecf4] bg-white p-5">
            <div className="mb-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[#2a2f39]">
              <HistoryOutlined /> Activity Log
            </div>
            <div className="space-y-4">
              {row.detail.activityLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 text-[13px]">
                  <EditOutlined className="mt-0.5 text-[#8a92a1]" />
                  <div>
                    <div className="text-[#2a2f39]">
                      {entry.message} By {entry.by}
                    </div>
                    <div className="mt-0.5 text-[#a0a7b5]">{entry.at}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

