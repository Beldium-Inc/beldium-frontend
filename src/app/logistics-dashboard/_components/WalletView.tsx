"use client";

import { useState } from "react";
import {
  walletStats,
  pendingPayout,
  transactions,
  walletRecentActivity,
} from "./data";
import { IconWallet, IconClock, IconCheckBadge, IconCheck, IconTruck, IconWarning } from "./icons";
import CashFlowChart from "./CashFlowChart";

const statIcons = [IconWallet, IconClock, IconCheckBadge, IconCheck];

function statusPill(status: string) {
  switch (status) {
    case "Paid":
      return "bg-green-50 text-green-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Processing":
      return "bg-blue-50 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function activityIcon(kind: string) {
  switch (kind) {
    case "in":
      return <IconWallet className="w-4 h-4" />;
    case "escrow":
      return <IconWarning className="w-4 h-4" />;
    case "truck":
      return <IconTruck className="w-4 h-4" />;
    default:
      return <IconCheck className="w-4 h-4" />;
  }
}

function activityIconStyle(kind: string) {
  switch (kind) {
    case "in":
      return "bg-green-50 text-green-600";
    case "escrow":
      return "bg-amber-50 text-amber-600";
    case "truck":
      return "bg-blue-50 text-blue-600";
    default:
      return "bg-purple-50 text-purple-600";
  }
}

export default function WalletView() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-400 mt-1">Track your earnings, payout, and transaction history</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {walletStats.map((s, i) => {
          const Icon = statIcons[i];
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <span className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" />
                </span>
                {s.label}
              </div>
              <div className={`text-2xl font-semibold ${s.accent}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
              {i === 0 && (
                <button className="mt-4 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90">
                  Withdraw funds →
                </button>
              )}
              {i === 1 && (
                <button className="mt-4 text-xs font-medium text-primary hover:underline">View Pending →</button>
              )}
              {i === 2 && (
                <button className="mt-4 text-xs font-medium text-primary hover:underline">
                  View Earnings History →
                </button>
              )}
              {i === 3 && (
                <button className="mt-4 text-xs font-medium text-primary hover:underline">
                  View Completed Jobs →
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-gray-900">Cash Flow</h2>
              <p className="text-xs text-gray-400 mt-0.5">Income received</p>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Last 6 months
            </button>
          </div>
          <CashFlowChart />
        </div>

        <div className="bg-white rounded-xl border border-amber-100 bg-amber-50/40 p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1">
            <IconClock className="w-3.5 h-3.5" />
            Pending Payout
          </span>
          <div className="text-2xl font-semibold text-gray-900 mt-4">{pendingPayout.amount}</div>

          <div className="mt-4 text-sm">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Transport Job</div>
            <div className="text-primary font-medium mt-0.5">{pendingPayout.jobId}</div>
          </div>

          <div className="mt-3 text-sm">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Status</div>
            <span className="inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              {pendingPayout.status}
            </span>
          </div>

          <div className="mt-3 text-sm">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Estimated Release</div>
            <div className="text-gray-800 mt-0.5">{pendingPayout.estimatedRelease}</div>
          </div>

          <button className="w-full mt-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            View Job Details →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h2 className="font-semibold text-gray-900">Transaction History</h2>
              <p className="text-xs text-gray-400 mt-0.5">View all earnings, payout, and related transactions</p>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Job ID, buyer, location..."
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none w-56"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Status · All status
            </button>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Payment · All
            </button>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              From · Select start date
            </button>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              To · Select end date
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 uppercase tracking-wide">
                  <th className="font-medium pb-2">Transaction ID</th>
                  <th className="font-medium pb-2">Job ID</th>
                  <th className="font-medium pb-2">Buyer / Miner</th>
                  <th className="font-medium pb-2">Amount</th>
                  <th className="font-medium pb-2">Status</th>
                  <th className="font-medium pb-2">Payment method</th>
                  <th className="font-medium pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.txnId}>
                    <td className="py-3 font-medium text-primary">{t.txnId}</td>
                    <td className="py-3 text-gray-700">{t.jobId}</td>
                    <td className="py-3 text-gray-700">{t.buyer}</td>
                    <td className="py-3 text-gray-800">{t.amount}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusPill(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{t.paymentDate}</td>
                    <td className="py-3 text-gray-500">{t.createdDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>You have 28 transactions (Displaying 7 per page)</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Previous</button>
              <button className="px-2.5 py-1 rounded-md bg-primary text-white">1</button>
              <button className="px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50">2</button>
              <span>...</span>
              <button className="px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50">9</button>
              <button className="px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50">10</button>
              <button className="px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-xs text-primary font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {walletRecentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activityIconStyle(a.kind)}`}
                >
                  {activityIcon(a.kind)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-800 font-medium">{a.title}</span>
                    {a.amount && <span className="text-gray-800 font-medium">{a.amount}</span>}
                  </div>
                  <div className="text-xs text-gray-400">{a.jobId}</div>
                  <div className="text-xs text-gray-400">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
