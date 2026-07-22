import type { StatusBadge } from "@/src/features/compliance/dashboard/mock";

export const iconToneStyles = {
  blue: "bg-[#e9f0ff] text-[#4a80ff]",
  orange: "bg-[#fff0e5] text-[#ff8739]",
  mint: "bg-[#e8fbf6] text-[#1bc4a3]",
  rose: "bg-[#ffeaf4] text-[#ff5e98]",
};

export const statusStyles: Record<
  StatusBadge["tone"],
  { container: string; dot: string }
> = {
  green: {
    container: "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]",
    dot: "bg-[#1fb538]",
  },
  amber: {
    container: "border border-[#f6e3bf] bg-[#fff4df] text-[#e09408]",
    dot: "bg-[#f3a000]",
  },
  red: {
    container: "border border-[#f7d6d7] bg-[#ffeff0] text-[#ef2f32]",
    dot: "bg-[#ef2f32]",
  },
  slate: {
    container: "border border-[#e5e8ef] bg-[#f4f6f9] text-[#6b7280]",
    dot: "bg-[#6b7280]",
  },
  mint: {
    container: "border border-[#c9efe5] bg-[#ebfbf5] text-[#119c78]",
    dot: "bg-[#18b78c]",
  },
  cyan: {
    container: "border border-[#d6edf4] bg-[#edf8fb] text-[#2387a3]",
    dot: "bg-[#2387a3]",
  },
  rose: {
    container: "border border-[#f8d7e6] bg-[#fff0f7] text-[#db2777]",
    dot: "bg-[#db2777]",
  },
};

export const primaryActionStyle = {
  color: "#ffffff",
  textShadow: "0 1px 0 rgba(0, 0, 0, 0.18)",
};

export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

