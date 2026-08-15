import Link from "next/link";
import type { DashboardPersona } from "@/src/features/compliance/dashboard/types";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";

export default function WorkspaceSwitch({ persona }: { persona: DashboardPersona }) {
  const options: Array<{ value: DashboardPersona; label: string }> = [
    { value: "admin", label: "Admin workspace" },
    { value: "compliance", label: "Compliance workspace" },
  ];

  return (
    <div className="inline-flex rounded-full border border-[#dfe5ef] bg-white p-1 shadow-[0_16px_30px_-24px_rgba(16,30,61,0.35)]">
      {options.map((option) => {
        const active = persona === option.value;

        return (
          <Link
            key={option.value}
            href={`/compliancedashboard?persona=${option.value}`}
            className={classNames(
              "rounded-full px-4 py-2 text-[14px] font-semibold transition-colors",
              active
                ? "bg-[#101e3d] !text-white"
                : "text-[#5b6472] hover:text-[#101e3d]",
            )}
            style={active ? primaryActionStyle : undefined}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

