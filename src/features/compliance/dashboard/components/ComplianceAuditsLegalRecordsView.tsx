"use client";

import type { ReactNode } from "react";
import {
  BellOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  FileSearchOutlined,
  LockOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";

type ActivityCard = {
  title: string;
  value: string;
  icon: ReactNode;
};

type SystemActivityLogRow = {
  date: string;
  time: string;
  userName: string;
  role: string;
  action: string;
  entity: string;
  details: string;
  status: "success" | "warning";
};

const activityCards: ActivityCard[] = [
  {
    title: "Case Approvals",
    value: "142",
    icon: <CheckCircleOutlined />,
  },
  {
    title: "Case Rejections",
    value: "38",
    icon: <WarningOutlined />,
  },
  {
    title: "Document Uploads",
    value: "256",
    icon: <FileSearchOutlined />,
  },
  {
    title: "Document Reviews",
    value: "198",
    icon: <EyeOutlined />,
  },
  {
    title: "Rule Changes",
    value: "47",
    icon: <SettingOutlined />,
  },
  {
    title: "Role Changes",
    value: "23",
    icon: <UserOutlined />,
  },
  {
    title: "Login Activity",
    value: "1847",
    icon: <LockOutlined />,
  },
  {
    title: "Notifications Sent",
    value: "892",
    icon: <BellOutlined />,
  },
];

const activityLogRows: SystemActivityLogRow[] = [
  {
    date: "2026-04-21",
    time: "13:14:52",
    userName: "A. Bello",
    role: "Compliance Officer",
    action: "Approved Case",
    entity: "Miner ID #234",
    details: "Compliance verification approved for export certificate",
    status: "success",
  },
  {
    date: "2026-04-21",
    time: "09:42:31",
    userName: "S. Okoye",
    role: "Compliance Admin",
    action: "Changed Rule",
    entity: "Verification Rules",
    details: "Updated threshold for gold purity verification from 22K to 24K",
    status: "success",
  },
  {
    date: "2026-04-21",
    time: "18:22:17",
    userName: "J. Smith",
    role: "Auditor",
    action: "Uploaded Document",
    entity: "Document #892",
    details: "Mining license scan uploaded for verification",
    status: "success",
  },
  {
    date: "2026-04-21",
    time: "02:51:06",
    userName: "S. Okafor",
    role: "Reviewer",
    action: "Sent Notification",
    entity: "Email Alert",
    details: "Mining license scan uploaded for verification",
    status: "success",
  },
  {
    date: "2026-04-21",
    time: "15:33:28",
    userName: "A. Bello",
    role: "Compliance Officer",
    action: "Sent Notification",
    entity: "Audit Logs",
    details: "Downloaded audit trail for Q1 2026 compliance review",
    status: "success",
  },
  {
    date: "2026-04-21",
    time: "21:15:49",
    userName: "M. Ibrahim",
    role: "Compliance Officer",
    action: "Rejected Case",
    entity: "Miner ID #189",
    details: "Insufficient documentation - missing valid mining permit",
    status: "warning",
  },
];

function ActivityMetricCard({ card }: { card: ActivityCard }) {
  return (
    <article className="rounded-[16px] border border-[#e2e7ef] bg-white px-5 py-5 shadow-[0_16px_34px_-36px_rgba(16,30,61,0.45)]">
      <div className="flex items-center gap-3 text-[#3b414d]">
        <span className="flex h-9 w-9 items-center justify-center text-[19px]">
          {card.icon}
        </span>
        <span className="text-[16px] font-medium tracking-[-0.01em] text-[#696f7a]">
          {card.title}
        </span>
      </div>

      <div className="mt-6 text-[28px] font-bold leading-none tracking-[-0.03em] text-[#1c2230]">
        {card.value}
      </div>
    </article>
  );
}

function ActivityStatusPill({ status }: { status: SystemActivityLogRow["status"] }) {
  if (status === "success") {
    return (
      <span className="inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-3 py-1 text-[11px] font-semibold text-[#16a34a]">
        Success
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-[#f2ddaf] bg-[#fff4de] px-3 py-1 text-[11px] font-semibold text-[#d39a1f]">
      Warning
    </span>
  );
}

export default function ComplianceAuditsLegalRecordsView() {
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#8a92a1]">
          <span>Settings</span>
          <span className="text-[#a6aeba]">›</span>
          <span className="font-medium text-[#5d6675]">Audits &amp; Legal Records</span>
        </div>

        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
            Audits &amp; Legal Records
          </h1>
          <p className="mt-2 max-w-[760px] text-[15px] text-[#6e7584]">
            Track, retain, and export compliance activity for legal and regulatory
            accountability.
          </p>
        </div>
      </div>

      <section className="rounded-[16px] border border-[#dfe5ef] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
        <h2 className="text-[24px] font-medium tracking-[-0.03em] text-[#2f3440]">
          Tracked Activities
        </h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
          {activityCards.map((card) => (
            <ActivityMetricCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-[#dfe5ef] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2563eb]">
            <FileSearchOutlined />
          </span>
          <h2 className="text-[24px] font-medium tracking-[-0.03em] text-[#2f3440]">
            System Activity Logs
          </h2>
        </div>

        <div className="mt-6 overflow-hidden rounded-[22px] border border-[#dfe5ef]">
          <div className="overflow-x-auto">
            <table className="min-w-[1360px] w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#f7f9fc] text-[15px] font-medium text-[#2f3541]">
                  <th className="border-b border-[#edf1f6] px-5 py-4">Timestamp</th>
                  <th className="border-b border-[#edf1f6] px-5 py-4">User</th>
                  <th className="border-b border-[#edf1f6] px-5 py-4">Action</th>
                  <th className="border-b border-[#edf1f6] px-5 py-4">Entity</th>
                  <th className="border-b border-[#edf1f6] px-5 py-4">Details</th>
                  <th className="border-b border-[#edf1f6] px-5 py-4">Status</th>
                  <th className="border-b border-[#edf1f6] px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {activityLogRows.map((row, index) => (
                  <tr
                    key={`${row.userName}-${row.time}-${row.entity}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                  >
                    <td className="border-b border-[#edf1f6] px-5 py-5 align-top">
                      <div className="text-[16px] font-medium leading-tight text-[#2f3440]">
                        {row.date}
                      </div>
                      <div className="mt-2 text-[14px] leading-tight text-[#7a8291]">
                        {row.time}
                      </div>
                    </td>

                    <td className="border-b border-[#edf1f6] px-5 py-5 align-top">
                      <div className="text-[16px] font-medium leading-tight text-[#2f3440]">
                        {row.userName}
                      </div>
                      <div className="mt-2 text-[14px] leading-tight text-[#7a8291]">
                        {row.role}
                      </div>
                    </td>

                    <td className="border-b border-[#edf1f6] px-5 py-5 align-top text-[16px] font-medium leading-tight text-[#2f3440]">
                      {row.action}
                    </td>

                    <td className="border-b border-[#edf1f6] px-5 py-5 align-top text-[16px] font-medium leading-tight text-[#6f7684]">
                      {row.entity}
                    </td>

                    <td className="border-b border-[#edf1f6] px-5 py-5 align-top">
                      <div className="max-w-[380px] truncate text-[16px] leading-tight text-[#434a57]">
                        {row.details}
                      </div>
                    </td>

                    <td className="border-b border-[#edf1f6] px-5 py-5 align-top">
                      <ActivityStatusPill status={row.status} />
                    </td>

                    <td className="border-b border-[#edf1f6] px-5 py-5 align-top text-right">
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Mock activity details for ${row.userName}. API integration pending.`,
                            "info",
                          )
                        }
                        className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#cfd7e4] bg-[#f4f7fb] px-4 text-[13px] font-medium text-[#4b525f] transition-colors hover:bg-white"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#edf1f6] px-5 py-4 text-[15px] text-[#7a8291] xl:flex-row xl:items-center xl:justify-between">
            <div>(Displaying 5 ▼ per page)</div>

            <div className="inline-flex items-center overflow-hidden rounded-[14px] border border-[#d8dfeb] bg-white">
              <button
                type="button"
                onClick={() => showToast("Mock pagination. API wiring is pending.", "info")}
                className="inline-flex h-10 items-center gap-2 border-r border-[#e5eaf3] px-4 text-[#9aa2b0]"
              >
                <span>←</span>
                Previous
              </button>

              {["1", "2", "3", "...", "8", "9", "10"].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => showToast("Mock pagination. API wiring is pending.", "info")}
                  className={`inline-flex h-10 min-w-10 items-center justify-center border-r border-[#e5eaf3] px-3 ${
                    page === "1" ? "bg-[#f4f7fb] text-[#2f3440]" : "text-[#2f3440]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => showToast("Mock pagination. API wiring is pending.", "info")}
                className="inline-flex h-10 items-center gap-2 px-4 text-[#2f3440]"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
