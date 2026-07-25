"use client";

import { cashFlowSeries } from "./data";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_L = 36;
const PAD_B = 24;
const MAX = 60;

function toPoints(values: number[]) {
  const stepX = (WIDTH - PAD_L) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = PAD_L + i * stepX;
      const y = HEIGHT - PAD_B - (v / MAX) * (HEIGHT - PAD_B - 10);
      return `${x},${y}`;
    })
    .join(" ");
}

const series = [
  { key: "income", label: "Income", color: "#16a34a", values: cashFlowSeries.income },
  { key: "withdrawals", label: "Withdrawals", color: "#2563eb", values: cashFlowSeries.withdrawals },
  { key: "pending", label: "Pending", color: "#f59e0b", values: cashFlowSeries.pending },
];

export default function CashFlowChart() {
  const gridValues = [0, 15, 30, 45, 60];

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-[220px]">
        {gridValues.map((g) => {
          const y = HEIGHT - PAD_B - (g / MAX) * (HEIGHT - PAD_B - 10);
          return (
            <g key={g}>
              <line x1={PAD_L} x2={WIDTH} y1={y} y2={y} stroke="#F1F2F4" strokeWidth={1} />
              <text x={0} y={y + 4} fontSize={10} fill="#9CA3AF">
                {g === 0 ? "N0" : `N${g}M`}
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
            const stepX = (WIDTH - PAD_L) / (s.values.length - 1);
            const x = PAD_L + i * stepX;
            const y = HEIGHT - PAD_B - (v / MAX) * (HEIGHT - PAD_B - 10);
            return <circle key={`${s.key}-${i}`} cx={x} cy={y} r={3} fill={s.color} />;
          })
        )}

        {cashFlowSeries.months.map((m, i) => {
          const stepX = (WIDTH - PAD_L) / (cashFlowSeries.months.length - 1);
          const x = PAD_L + i * stepX;
          return (
            <text key={m} x={x} y={HEIGHT - 4} fontSize={10} fill="#9CA3AF" textAnchor="middle">
              {m}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
