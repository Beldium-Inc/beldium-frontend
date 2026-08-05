"use client";

import Image from "next/image";
import {
  AppstoreOutlined,
  FolderOpenOutlined,
  FileSearchOutlined,
  WalletOutlined,
  CarOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";

export type NavKey =
  | "overview"
  | "opportunities"
  | "assigned"
  | "wallet"
  | "fleet"
  | "notifications"
  | "settings";

const navItems: {
  key: NavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}[] = [
  { key: "overview", label: "Overview", icon: AppstoreOutlined },
  { key: "opportunities", label: "Transport Opportunities", icon: FolderOpenOutlined, badge: 7 },
  { key: "assigned", label: "Assigned Jobs", icon: FileSearchOutlined, badge: 7 },
  { key: "wallet", label: "Wallet", icon: WalletOutlined },
  { key: "fleet", label: "Fleet management", icon: CarOutlined },
  { key: "notifications", label: "Notifications", icon: BellOutlined, badge: 7 },
  { key: "settings", label: "Settings", icon: SettingOutlined },
];

export default function LogisticsSidebar({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}) {
  return (
    <aside className="hidden xl:flex w-[280px] shrink-0 flex-col border-r border-[#e9edf5] bg-white">
      <div className="flex h-[96px] items-center gap-3 px-6">
        <Image src="/assets/images/logo.png" alt="Beldium" width={34} height={34} />
        <span className="text-[18px] font-semibold text-[#172554]">Beldium</span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-7 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={classNames(
                "flex items-center gap-3 rounded-l-lg border-r-[3px] px-3 py-4.5 text-left text-[15px] font-medium transition-colors",
                isActive
                  ? "border-r-[#101e3d] bg-[#d9e8ff] text-[#101e3d]"
                  : "border-r-transparent text-[#3b4253] hover:bg-[#f5f7fb] hover:text-[#101e3d]",
              )}
            >
              <Icon
                className={classNames("text-[18px] shrink-0", isActive ? "text-[#123f8f]" : "text-[#202534]")}
              />
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.badge != null && (
                <span
                  className={classNames(
                    "shrink-0 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-medium flex items-center justify-center",
                    isActive ? "bg-[#101e3d] text-white" : "bg-[#f4f6f9] text-[#6b7280]",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-6 pb-10">
        <button
          type="button"
          className="inline-flex items-center gap-3 text-[16px] font-medium text-[#ef2f32] transition-colors hover:text-[#d72225]"
        >
          <LogoutOutlined className="text-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
