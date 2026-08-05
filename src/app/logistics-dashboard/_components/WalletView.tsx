"use client";

import { useMemo, useState } from "react";
import {
  WalletOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { useRfqTransactions } from "./useLogisticsData";
import CashFlowChart from "./CashFlowChart";
import type { TransactionRecord } from "./types";

const statIcons = [WalletOutlined, ClockCircleOutlined, CheckCircleOutlined, CheckSquareOutlined];

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function finalStatusPill(status: TransactionRecord["final_status"]) {
  switch (status) {
    case "completed":
      return statusStyles.green;
    case "in_progress":
      return statusStyles.cyan;
    case "cancelled":
      return statusStyles.red;
    case "initiated":
    default:
      return statusStyles.amber;
  }
}

export default function WalletView() {
  const [query, setQuery] = useState("");
  const { data: transactions, isLoading, isError } = useRfqTransactions();

  const list = useMemo(() => transactions ?? [], [transactions]);

  const stats = useMemo(() => {
    const delivered = list.filter((t) => t.shipment_status === "delivered");
    const pending = list.filter((t) => t.shipment_status === "assigned" || t.shipment_status === "in_transit");
    // "Available Balance" has no real meaning here - there's no payout or
    // withdrawal model on the backend, so this card is relabeled to a real,
    // derivable figure (sum of delivered job values) instead of implying a
    // withdrawable bank-style balance.
    const totalDeliveredValue = delivered.reduce((sum, t) => sum + Number(t.total_value ?? 0), 0);
    const pendingValue = pending.reduce((sum, t) => sum + Number(t.total_value ?? 0), 0);
    const totalEarnings = list
      .filter((t) => t.final_status !== "cancelled")
      .reduce((sum, t) => sum + Number(t.total_value ?? 0), 0);

    return [
      { label: "Total Delivered Value", value: formatNaira(totalDeliveredValue), sub: "Sum of delivered job values", accent: "text-[#1ea43b]" },
      { label: "Pending Payments", value: formatNaira(pendingValue), sub: "Awaiting delivery confirmation", accent: "text-[#e09408]" },
      { label: "Total Earnings", value: formatNaira(totalEarnings), sub: "Lifetime, excluding cancelled", accent: "text-[#172554]" },
      { label: "Completed Jobs Paid", value: String(delivered.length), sub: "Successfully settled", accent: "text-[#172554]" },
    ];
  }, [list]);

  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((t) => t.id.toLowerCase().includes(q) || t.rfq.toLowerCase().includes(q));
  }, [list, query]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Wallet</h1>
        <p className="text-sm text-[#8b93a1] mt-1">Track your earnings, payout, and transaction history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
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
                  onClick={() => showToast("Payouts aren't connected to the backend yet.", "info")}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-[#101e3d] !text-white text-xs font-medium hover:bg-[#182a52]"
                >
                  Withdraw funds
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold text-[#172554]">Cash Flow</h2>
            <p className="text-xs text-[#8b93a1] mt-0.5">Delivered vs. in-progress value by month</p>
          </div>
        </div>
        <CashFlowChart transactions={list} />
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-[#172554]">Transaction History</h2>
            <p className="text-xs text-[#8b93a1] mt-0.5">All escrow transactions tied to your logistics assignments</p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transaction or RFQ ID..."
            className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-1.5 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none w-56"
          />
        </div>

        {isLoading && <div className="py-10 text-center text-[#8b93a1] text-sm">Loading transactions...</div>}
        {isError && !isLoading && (
          <div className="py-10 text-center text-[#ef2f32] text-sm">Could not load transactions.</div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="py-10 text-center text-[#8b93a1] text-sm">
            No transactions yet. Escrow records appear once a job you accept is funded.
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-[#8b93a1] uppercase tracking-wide">
                  <th className="font-medium pb-2">Transaction ID</th>
                  <th className="font-medium pb-2">RFQ</th>
                  <th className="font-medium pb-2">Amount</th>
                  <th className="font-medium pb-2">Shipment</th>
                  <th className="font-medium pb-2">Final Status</th>
                  <th className="font-medium pb-2">Escrow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f7]">
                {filtered.map((t) => {
                  const pill = finalStatusPill(t.final_status);
                  return (
                    <tr key={t.id}>
                      <td className="py-3 font-medium text-[#101e3d]">{t.id.slice(0, 8)}</td>
                      <td className="py-3 text-[#293041]">{t.rfq.slice(0, 8)}</td>
                      <td className="py-3 text-[#293041]">
                        {t.total_value ? formatNaira(Number(t.total_value)) : "Not set"}
                      </td>
                      <td className="py-3 text-[#6f7786] capitalize">{t.shipment_status.replace("_", " ")}</td>
                      <td className="py-3">
                        <span className={classNames("text-xs font-medium px-2.5 py-1 rounded-full", pill.container)}>
                          {t.final_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 text-[#6f7786]">{t.escrow_status || "Not set"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
