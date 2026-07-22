import type { ReactNode } from "react";
import {
  FilePdfOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { ReviewDocumentKind } from "@/src/features/compliance/dashboard/types";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";

export function ReviewInfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e7ebf2] bg-[#fafbfd] p-4">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
        <span className="text-[14px] text-[#7b8392]">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-[15px] font-medium text-[#2d3441]">{value}</div>
    </div>
  );
}

export function ReviewDocumentRow({
  name,
  type,
  locked,
  viewUrl,
  downloadUrl,
}: {
  name: string;
  type: ReviewDocumentKind;
  locked: boolean;
  viewUrl?: string;
  downloadUrl?: string;
}) {
  const Icon =
    type === "pdf"
      ? FilePdfOutlined
      : type === "image"
        ? FileImageOutlined
        : FileSearchOutlined;
  const canOpen = !locked && Boolean(viewUrl);
  const canDownload = !locked && Boolean(downloadUrl);

  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[#e8ecf4] bg-white px-4 py-4">
      <div className="flex items-center gap-3">
        <span
          className={classNames(
            "flex h-10 w-10 items-center justify-center rounded-[14px] text-[18px]",
            type === "pdf"
              ? "bg-[#ecfff3] text-[#14b85f]"
              : type === "image"
                ? "bg-[#eef4ff] text-[#2661d8]"
                : "bg-[#f4f7fb] text-[#5e6777]",
          )}
        >
          <Icon />
        </span>
        <div>
          <div className="text-[15px] font-medium text-[#293041]">{name}</div>
          <div className="mt-1 text-[13px] text-[#8a92a1]">
            {locked ? "Accept task to unlock sensitive data" : "Ready for review"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={classNames(
            "inline-flex items-center gap-2 rounded-xl px-3 py-3 text-[12px] font-medium",
            locked
              ? "border border-[#e8ecf4] bg-[#f7f9fc] text-[#7f8796]"
              : "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]",
          )}
        >
          {locked ? (
            <>
              <InfoCircleOutlined />
              
            </>
          ) : (
            <>
              <CheckCircleOutlined />
              
            </>
          )}
        </span>

        <a
          href={canOpen ? viewUrl : undefined}
          target={canOpen ? "_blank" : undefined}
          rel={canOpen ? "noreferrer" : undefined}
          aria-disabled={!canOpen}
          className={classNames(
            "inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition-colors",
            canOpen
              ? "border-[#dce3ef] bg-white text-[#2b3140] hover:bg-[#f8fbff]"
              : "pointer-events-none border-[#eef2f7] bg-[#f7f9fc] text-[#a0a7b5]",
          )}
        >
          <EyeOutlined />
          
        </a>

        <a
          href={canDownload ? downloadUrl : undefined}
          target={canDownload ? "_blank" : undefined}
          rel={canDownload ? "noreferrer" : undefined}
          download={canDownload ? name : undefined}
          aria-disabled={!canDownload}
          className={classNames(
            "inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition-colors",
            canDownload
              ? "border-[#dce3ef] bg-white text-[#2b3140] hover:bg-[#f8fbff]"
              : "pointer-events-none border-[#eef2f7] bg-[#f7f9fc] text-[#a0a7b5]",
          )}
        >
          <DownloadOutlined />
          
        </a>
      </div>
    </div>
  );
}

