"use client";

import {
  IconGrid,
  IconBoard,
  IconBox,
  IconWallet,
  IconTruck,
  IconBell,
  IconGear,
  IconLogout,
} from "./icons";

export type NavKey =
  | "overview"
  | "opportunities"
  | "assigned"
  | "wallet"
  | "fleet"
  | "notifications"
  | "settings";

const navItems: { key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: IconGrid },
  { key: "opportunities", label: "Transport Opportunities", icon: IconBoard },
  { key: "assigned", label: "Assigned Jobs", icon: IconBox },
  { key: "wallet", label: "Wallet", icon: IconWallet },
  { key: "fleet", label: "Fleet management", icon: IconTruck },
  { key: "notifications", label: "Notifications", icon: IconBell },
  { key: "settings", label: "Settings", icon: IconGear },
];

export default function LogisticsSidebar({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}) {
  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-white border-r border-gray-100 pt-6">
      <div className="flex items-center gap-2 px-6 pb-8">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
          B
        </div>
        <span className="font-semibold text-[17px] text-gray-900">Beldium</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                isActive
                  ? "bg-secondary text-primary font-medium border-l-[3px] border-primary -ml-[3px] pl-[calc(0.75rem+3px)]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left">
          <IconLogout className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
