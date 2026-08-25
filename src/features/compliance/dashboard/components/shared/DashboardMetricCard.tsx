import { ArrowRightOutlined } from "@ant-design/icons";
import type { StatusBadge, TrendDirection } from "@/src/features/compliance/dashboard/mock";
import type { MetricCardProps } from "@/src/features/compliance/dashboard/types";
import { classNames, statusStyles, iconToneStyles } from "@/src/features/compliance/dashboard/lib/style";
import { getTrendMeta } from "@/src/features/compliance/dashboard/lib/format";

export function StatusBadgePill({ badge }: { badge: StatusBadge }) {
  const style = statusStyles[badge.tone];

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        style.container,
      )}
    >
      <span className={classNames("h-1.5 w-1.5 rounded-full", style.dot)} />
      {badge.label}
    </span>
  );
}

export function TrendMeta({
  direction,
  text,
  featured = false,
}: {
  direction?: TrendDirection;
  text?: string;
  featured?: boolean;
}) {
  if (!text) {
    return null;
  }

  const trend = getTrendMeta(direction);

  return (
    <div
      className={classNames(
        "mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium",
        featured ? "text-[#89e79f]" : trend.className,
      )}
    >
      <span>{featured ? "↗" : trend.icon}</span>
      <span>{text}</span>
    </div>
  );
}

export function ArrowActionButton({ featured = false }: { featured?: boolean }) {
  return (
    <button
      type="button"
      className={classNames(
        "mt-auto flex h-9 w-9 items-center justify-center rounded-full text-[14px] transition-transform hover:-translate-y-0.5",
        featured
          ? "bg-white/14 !text-white"
          : "bg-[#eef1f6] text-[#687081] hover:bg-[#e7ebf2]",
      )}
    >
      <ArrowRightOutlined className="-rotate-45" />
    </button>
  );
}

export function LinearProgress({
  value,
  tone = "green",
}: {
  value: number;
  tone?: "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "bg-[#18b829]"
      : tone === "amber"
        ? "bg-[#f3a000]"
        : "bg-[#ef2f32]";

  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#e8ecf2]">
      <div
        className={classNames("h-full rounded-full", toneClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function ScoreMeter({ score }: { score: number }) {
  const tone: "green" | "amber" | "red" =
    score >= 80 ? "green" : score >= 50 ? "amber" : "red";

  return (
    <div className="min-w-[160px]">
      <LinearProgress value={score} tone={tone} />
    </div>
  );
}

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 26,
}: {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAccum = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef1f6" strokeWidth={strokeWidth} />
        {total > 0
          ? segments
              .filter((s) => s.value > 0)
              .map((segment) => {
                const fraction = segment.value / total;
                const dash = fraction * circumference;
                const gap = circumference - dash;
                const dashOffset = -offsetAccum;
                offsetAccum += dash;
                return (
                  <circle
                    key={segment.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={dashOffset}
                  />
                );
              })
          : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-semibold text-[#202534]">{total}</span>
        <span className="text-[11px] text-[#8a92a1]">Total cases</span>
      </div>
    </div>
  );
}

export function TrendLineChart({
  points,
  height = 160,
}: {
  points: { label: string; score: number }[];
  height?: number;
}) {
  if (points.length < 2) {
    return null;
  }

  const width = 560;
  const padding = 24;
  const max = 100;
  const min = 0;
  const stepX = (width - padding * 2) / (points.length - 1);
  const toY = (score: number) =>
    height - padding - ((score - min) / (max - min)) * (height - padding * 2);

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${padding + index * stepX} ${toY(point.score)}`)
    .join(" ");
  const areaPath = `${linePath} L ${padding + (points.length - 1) * stepX} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <path d={areaPath} fill="url(#trendFill)" opacity={0.5} />
      <path d={linePath} fill="none" stroke="#1a2a52" strokeWidth={2.5} strokeLinecap="round" />
      {points.map((point, index) => (
        <circle key={point.label} cx={padding + index * stepX} cy={toY(point.score)} r={3.5} fill="#1a2a52" />
      ))}
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a52" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#1a2a52" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SimpleBarChart({
  bars,
  height = 180,
}: {
  bars: { label: string; value: number; color: string }[];
  height?: number;
}) {
  if (bars.length === 0) {
    return null;
  }

  const max = Math.max(100, ...bars.map((b) => b.value));

  return (
    <div className="flex items-end justify-between gap-4" style={{ height }}>
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-[6px]"
              style={{ height: `${Math.max(4, (bar.value / max) * 100)}%`, backgroundColor: bar.color }}
            />
          </div>
          <span className="text-[12px] text-[#8a92a1]">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SpeedRing({ label }: { label: string }) {
  return (
    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[8px] border-[#19b649] border-l-[#e4edf2] border-b-[#e4edf2] text-[11px] font-semibold tracking-[0.14em] text-[#677080]">
      {label}
    </div>
  );
}

export function DashboardMetricCard({
  title,
  value,
  icon,
  iconTone,
  trendText,
  trendDirection,
  note,
  featured = false,
  progress,
  showAction = true,
  footer,
}: MetricCardProps) {
  return (
    <div
      className={classNames(
        "rounded-[16px] border p-4 shadow-[0_16px_32px_-28px_rgba(16,30,61,0.4)]",
        featured
          ? "border-[#4c4f56] bg-[#45474b] !text-white"
          : "border-[#e7ebf2] bg-white text-[#202534]",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={classNames(
            "flex h-9 w-9 items-center justify-center rounded-full text-[15px]",
            featured ? "bg-white/10 text-[#74a3ff]" : iconToneStyles[iconTone],
          )}
        >
          {icon}
        </span>
        <span
          className={classNames(
            "text-[13px] font-medium",
            featured ? "text-white/90" : "text-[#3a3e48]",
          )}
        >
          {title}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div
            className={classNames(
              "text-[28px] font-semibold leading-none tracking-[-0.03em]",
              featured ? "!text-white" : "text-[#272b33]",
            )}
          >
            {value}
          </div>
          {progress != null ? <LinearProgress value={progress} /> : null}
          <TrendMeta
            direction={trendDirection}
            text={trendText}
            featured={featured}
          />
          {note ? (
            <div
              className={classNames(
                "mt-3 text-[11px]",
                featured ? "text-white/60" : "text-[#9aa1af]",
              )}
            >
              {note}
            </div>
          ) : null}
        </div>

        {footer ?? (showAction ? <ArrowActionButton featured={featured} /> : null)}
      </div>
    </div>
  );
}

