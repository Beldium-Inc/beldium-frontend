"use client";

import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { useRfqTransactions } from "./useLogisticsData";

function formatNaira(value: string | null) {
  if (!value) return "Not set";
  return `₦${Number(value).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function RecentEarnings() {
  const { data: transactions, isLoading } = useRfqTransactions();
  const recent = (transactions ?? [])
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <h2 className="font-semibold text-[#172554] mb-4">Recent Earnings</h2>

      {isLoading && <p className="text-sm text-[#8b93a1]">Loading...</p>}
      {!isLoading && recent.length === 0 && (
        <p className="text-sm text-[#8b93a1]">No settled transactions yet.</p>
      )}

      <div className="space-y-3">
        {recent.map((t) => {
          const pill = t.final_status === "completed" ? statusStyles.green : statusStyles.amber;
          return (
            <div key={t.id} className="flex items-center justify-between text-sm gap-2">
              <span className="font-medium text-[#101e3d]">{t.id.slice(0, 8)}</span>
              <span className="text-[#293041]">{formatNaira(t.total_value)}</span>
              <span className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0", pill.container)}>
                {t.final_status === "completed" ? "Completed" : "Pending"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
