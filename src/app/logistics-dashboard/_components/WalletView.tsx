"use client";

import { useMemo, useState } from "react";
import {
  WalletOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ArrowDownOutlined,
  SyncOutlined,
  CheckOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import CashFlowChart from "./CashFlowChart";
import {
  walletStats,
  cashFlowSeries,
  pendingPayout,
  transactions,
  walletRecentActivity,
  Transaction,
} from "./data";

const statIcons = [WalletOutlined, ClockCircleOutlined, CheckCircleOutlined, CheckSquareOutlined];

function statusPill(status: Transaction["status"]) {
  switch (status) {
    case "Paid":
      return statusStyles.green;
    case "Processing":
      return statusStyles.slate;
    case "Pending":
    default:
      return statusStyles.amber;
  }
}

const activityIcon = {
  in: <ArrowDownOutlined className="text-[#1ea43b]" />,
  escrow: <SyncOutlined className="text-[#2f6fed]" />,
  check: <CheckOutlined className="text-[#1ea43b]" />,
  truck: <CarOutlined className="text-[#101e3d]" />,
};

export default function WalletView() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => {
    if (!query.trim()) return transactions;
    const q = query.toLowerCase();
    return transactions.filter(
      (t) => t.txnId.toLowerCase().includes(q) || t.jobId.toLowerCase().includes(q) || t.buyer.toLowerCase().includes(q),
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Wallet</h1>
        <p className="text-sm text-[#8b93a1] mt-1">Track you r earnings, payout, and transaction history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {walletStats.map((s, i) => {
            const Icon = statIcons[i];
            return (
              <div
                key={s.label}
                className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
              >
                <div className="flex items-center gap-2 text-[#6f7786] text-sm mb-4">
                  <span className="w-8 h-8 rounded-lg bg-[#e9f0ff] flex items-center justify-center text-[#101e3d]">
                    <Icon className="text-[15px]" />
                  </span>
                  {s.label}
                </div>
                <div className={classNames("text-2xl font-semibold", s.accent)}>{s.value}</div>
                <div className="text-xs text-[#8b93a1] mt-1">{s.sub}</div>
                {i === 0 && (
                  <button
                    type="button"
                    onClick={() => showToast("Withdrawals aren't connected to the backend yet.", "info")}
                    className="mt-4 px-3 py-1.5 rounded-lg bg-[#101e3d] !text-white text-xs font-medium hover:bg-[#182a52]"
                  >
                    Withdraw funds
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-[16px] border border-[#f6e3bf] bg-[#fffaf0] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#e09408]">
            <CheckCircleOutlined /> Pending Payout
          </div>
          <div className="text-2xl font-semibold text-[#293041] mt-3">{pendingPayout.amount}</div>
          <div className="mt-4 text-[11px] text-[#8b93a1] uppercase tracking-wide">Transport Job</div>
          <div className="text-sm font-medium text-[#293041]">{pendingPayout.jobId}</div>
          <div className="mt-3 text-[11px] text-[#8b93a1] uppercase tracking-wide">Status</div>
          <span className={classNames("inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full", statusStyles.amber.container)}>
            {pendingPayout.status}
          </span>
          <div className="mt-3 text-[11px] text-[#8b93a1] uppercase tracking-wide">Estimated Release</div>
          <div className="text-sm font-medium text-[#293041]">{pendingPayout.estimatedRelease}</div>
          <button
            type="button"
            className="mt-4 w-full text-sm px-4 py-2 rounded-lg border border-[#f6e3bf] text-[#293041] hover:bg-white"
          >
            View Job Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-[#172554]">Cash Flow</h2>
              <p className="text-xs text-[#8b93a1] mt-0.5">Income received</p>
            </div>
            <select className="text-xs text-[#6f7786] bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-2.5 py-1.5 outline-none">
              <option>Last 6 months</option>
            </select>
          </div>
          <CashFlowChart data={cashFlowSeries} />
        </div>

        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#172554]">Recent Activity</h2>
            <button type="button" className="text-xs text-[#101e3d] font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {walletRecentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4f6f9] text-[13px]">
                  {activityIcon[a.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#293041]">{a.title}</span>
                    {a.amount && <span className="text-sm font-semibold text-[#293041] shrink-0">{a.amount}</span>}
                  </div>
                  <div className="text-xs text-[#8b93a1]">{a.jobId}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-[#172554]">Transaction History</h2>
            <p className="text-xs text-[#8b93a1] mt-0.5">View all earnings, payout, and related transactions</p>
          </div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search Job ID, mineral, buyer, location..."
            className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-1.5 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-[#8b93a1] uppercase tracking-wide">
                <th className="font-medium pb-2">Transaction ID</th>
                <th className="font-medium pb-2">Job ID</th>
                <th className="font-medium pb-2">Buyer / Miner</th>
                <th className="font-medium pb-2">Amount</th>
                <th className="font-medium pb-2">Status</th>
                <th className="font-medium pb-2">Payment method</th>
                <th className="font-medium pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f7]">
              {paged.map((t) => {
                const pill = statusPill(t.status);
                return (
                  <tr key={t.txnId}>
                    <td className="py-3 font-medium text-[#101e3d]">{t.txnId}</td>
                    <td className="py-3 text-[#293041]">{t.jobId}</td>
                    <td className="py-3 text-[#293041]">{t.buyer}</td>
                    <td className="py-3 text-[#293041]">{t.amount}</td>
                    <td className="py-3">
                      <span className={classNames("text-xs font-medium px-2.5 py-1 rounded-full", pill.container)}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-[#6f7786]">{t.paymentDate}</td>
                    <td className="py-3 text-[#6f7786]">{t.createdDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-[#8b93a1]">
          <span>
            You have {filtered.length} transactions (Displaying {paged.length} per page)
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-[#e4e9f2] disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i + 1)}
                className={classNames(
                  "px-2.5 py-1 rounded-lg border",
                  page === i + 1 ? "border-[#101e3d] bg-[#101e3d] text-white" : "border-[#e4e9f2] text-[#293041]",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-[#e4e9f2] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
