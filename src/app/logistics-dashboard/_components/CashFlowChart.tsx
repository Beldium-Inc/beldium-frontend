"use client";

import type { TransactionRecord } from "./types";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_L = 44;
const PAD_B = 24;

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CashFlowChart({ transactions }: { transactions: TransactionRecord[] }) {
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const delivered = new Map<string, number>();
  const pending = new Map<string, number>();
  months.forEach((m) => {
    delivered.set(m, 0);
    pending.set(m, 0);
  });

  transactions.forEach((t) => {
    const key = monthKey(t.created_at);
    if (!delivered.has(key)) return;
    const value = Number(t.total_value ?? 0);
    if (t.final_status === "completed") {
      delivered.set(key, (delivered.get(key) ?? 0) + value);
    } else if (t.final_status !== "cancelled") {
      pending.set(key, (pending.get(key) ?? 0) + value);
    }
  });

  const deliveredValues = months.map((m) => delivered.get(m) ?? 0);
  const pendingValues = months.map((m) => pending.get(m) ?? 0);
  const max = Math.max(1, ...deliveredValues, ...pendingValues);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  function toPoints(values: number[]) {
    const stepX = (WIDTH - PAD_L) / Math.max(1, values.length - 1);
    return values
      .map((v, i) => {
        const x = PAD_L + i * stepX;
        const y = HEIGHT - PAD_B - (v / max) * (HEIGHT - PAD_B - 10);
        return `${x},${y}`;
      })
      .join(" ");
  }

  const series = [
    { key: "delivered", label: "Delivered value", color: "#1ea43b", values: deliveredValues },
    { key: "pending", label: "In progress value", color: "#e09408", values: pendingValues },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-[#6f7786]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-[220px]">
        {gridValues.map((g) => {
          const y = HEIGHT - PAD_B - (g / max) * (HEIGHT - PAD_B - 10);
          return (
            <g key={g}>
              <line x1={PAD_L} x2={WIDTH} y1={y} y2={y} stroke="#F1F2F4" strokeWidth={1} />
              <text x={0} y={y + 4} fontSize={9} fill="#9CA3AF">
                {g >= 1000000 ? `₦${(g / 1000000).toFixed(1)}M` : `₦${g}`}
              </text>
            </g>
          );
        })}

        {series.map((s) => (
          <polyline
            key={s.key}
            points={toPoints(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {series.map((s) =>
          s.values.map((v, i) => {
            const stepX = (WIDTH - PAD_L) / Math.max(1, s.values.length - 1);
            const x = PAD_L + i * stepX;
            const y = HEIGHT - PAD_B - (v / max) * (HEIGHT - PAD_B - 10);
            return <circle key={`${s.key}-${i}`} cx={x} cy={y} r={3} fill={s.color} />;
          }),
        )}

        {months.map((m, i) => {
          const stepX = (WIDTH - PAD_L) / Math.max(1, months.length - 1);
          const x = PAD_L + i * stepX;
          return (
            <text key={m} x={x} y={HEIGHT - 4} fontSize={10} fill="#9CA3AF" textAnchor="middle">
              {monthLabel(m)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
