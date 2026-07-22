"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  DownOutlined,
  UserOutlined,
  ApartmentOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { DashboardPersona, ComplianceView } from "@/src/features/compliance/dashboard/types";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { complianceProfileCard } from "@/src/features/compliance/dashboard/lib/profile-data";

function OnlineToggle() {
  const [online, setOnline] = useState(true);

  return (
    <button
      type="button"
      onClick={() => setOnline((prev) => !prev)}
      className="flex items-center gap-3"
      aria-pressed={online}
    >
      <span
        className={classNames(
          "relative flex h-7 w-14 rounded-full p-1 transition-colors duration-200",
          online ? "bg-[#18bf54]" : "bg-[#d1d5db]"
        )}
      >
        <span
          className={classNames(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            online ? "translate-x-7" : "translate-x-0"
          )}
        />
      </span>
      <span
        className={classNames(
          "text-[13px] font-semibold tracking-[0.1em]",
          online ? "text-[#15a93d]" : "text-[#9ca3af]"
        )}
      >
        {online ? "ONLINE" : "OFFLINE"}
      </span>
    </button>
  );
}

export default function DashboardTopBar({
  persona,
  complianceView,
  onMenuNavigate,
  searchTerm,
  onSearchTermChange,
}: {
  persona: DashboardPersona;
  complianceView?: ComplianceView;
  onMenuNavigate?: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const roleLabel = persona === "admin" ? "Admin" : complianceProfileCard.role;
  const isSettingsSurface =
    complianceView === "settings" ||
    complianceView === "organization-profile" ||
    complianceView === "regulatory-scope" ||
    complianceView === "teams-roles" ||
    complianceView === "verification-rules-thresholds" ||
    complianceView === "documents-data-controls" ||
    complianceView === "notifications-alerts" ||
    complianceView === "security-access-controls" ||
    complianceView === "audits-legal-records";
  const settingsButtonClassName = classNames(
    "flex h-10 w-10 items-center justify-center rounded-full border text-[18px] transition-colors",
    isSettingsSurface
      ? "border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b] shadow-[0_18px_30px_-26px_rgba(30,164,59,0.65)]"
      : "border-[#eceef4] bg-[#f9fafc] text-[#2a3142] hover:bg-white",
  );

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isProfileMenuOpen]);

  const handleProfileMenuToggle = () => {
    if (persona !== "compliance") {
      return;
    }

    setIsProfileMenuOpen((current) => !current);
  };

  return (
    <header className="relative z-40 border-b border-[#e9edf5] bg-white/95 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="flex items-center gap-3 xl:hidden">
          <Image
            src="/assets/images/logo.png"
            alt="Beldium"
            width={28}
            height={28}
          />
          <span className="text-xl font-semibold text-[#172554]">Beldium</span>
        </div>

        <div className="relative w-full max-w-[280px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search miner"
            className="h-12 w-full rounded-full border border-[#dbe0ea] bg-white pl-6 pr-14 text-[17px] text-[#293041] outline-none transition-shadow placeholder:text-[#8b93a1] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
          />
          <SearchOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[20px] text-[#687081]" />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
          <div className="flex items-center gap-2 rounded-full border border-[#e4e9f2] bg-[#f9fafb] px-3 py-1.5">
  <span className="text-[13px] text-[#707785]">Status</span>
  <OnlineToggle />
</div>

          <span className="inline-flex h-12 items-center rounded-[16px] border border-[#b8e3bf] bg-[#f1fff3] px-5 text-[15px] font-medium text-[#13a236]">
            Pilot Phase
          </span>

          <Link
            href={`/compliancedashboard?persona=${persona}&view=settings`}
            onClick={() => {
              onMenuNavigate?.();
              setIsProfileMenuOpen(false);
            }}
            aria-label="Open settings"
            aria-current={isSettingsSurface ? "page" : undefined}
            className={settingsButtonClassName}
          >
            <SettingOutlined />
          </Link>


<Link
  href={`/compliancedashboard?persona=${persona}&view=notifications`}
  onClick={() => {
    onMenuNavigate?.();
    setIsProfileMenuOpen(false);
  }}
  aria-label="Open Notifications"
>
  <button
    type="button"
    className={`relative flex h-10 w-10 items-center justify-center rounded-full border text-[22px] transition-colors
      ${complianceView === "notifications"
        ? "border-[#C8DDFECC] bg-[#fff1ee] text-[#C8DDFECC] shadow-[0_0_0_4px_rgba(255,71,38,0.15)]"
        : "border-[#eceef4] bg-[#f9fafc] text-[#2a3142] hover:bg-white"
      }`}
  >
    <BellOutlined />
    <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#ff4726]" />
  </button>
</Link>


          <div className="hidden h-12 w-px bg-[#e4e7ee] lg:block" />

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={handleProfileMenuToggle}
              aria-expanded={persona === "compliance" ? isProfileMenuOpen : undefined}
              aria-haspopup={persona === "compliance" ? "menu" : undefined}
              className={classNames(
                "flex items-center gap-3 rounded-full border px-3 py-2 text-left transition-colors",
                persona === "compliance"
                  ? "border-[#edf1f7] bg-[#f5f7fb] hover:border-[#dfe5ef] hover:bg-white"
                  : "border-transparent bg-[#f5f7fb]",
              )}
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <Image
                  src={complianceProfileCard.avatarSrc}
                  alt={complianceProfileCard.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold text-[#1f2635]">
                  {complianceProfileCard.name}
                </div>
                <div className="mt-1 text-[12px] text-[#7a8291]">{roleLabel}</div>
              </div>
              {persona === "compliance" ? (
                <DownOutlined
                  className={classNames(
                    "ml-2 text-[14px] text-[#4f5664] transition-transform",
                    isProfileMenuOpen && "rotate-180",
                  )}
                />
              ) : null}
            </button>

            {persona === "compliance" && isProfileMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[310px] overflow-hidden rounded-[20px] border border-[#e1e6ef] bg-white shadow-[0_30px_60px_-34px_rgba(16,30,61,0.38)]">
                <div className="border-b border-[#edf1f7] px-5 py-4">
                  <div className="text-[16px] font-semibold text-[#1f2635]">
                    {complianceProfileCard.name}
                  </div>
                  <div className="mt-1 text-[14px] text-[#6f7786]">
                    {complianceProfileCard.role}
                  </div>
                  <div className="mt-1 text-[14px] text-[#7f8796]">
                    {complianceProfileCard.email}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/compliancedashboard?persona=compliance&view=profile"
                    onClick={() => {
                      onMenuNavigate?.();
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-[15px] font-medium text-[#333a48] transition-colors hover:bg-[#f7f9fc]"
                  >
                    <UserOutlined className="text-[18px] text-[#4f5664]" />
                    View my profile
                  </Link>
                  <Link
                    href="/compliancedashboard?persona=compliance&view=compliance-profile"
                    onClick={() => {
                      onMenuNavigate?.();
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-[15px] font-medium text-[#333a48] transition-colors hover:bg-[#f7f9fc]"
                  >
                    <ApartmentOutlined className="text-[18px] text-[#4f5664]" />
                    View compliance profile
                  </Link>
                </div>

                <div className="border-t border-[#edf1f7] p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      sessionStorage.clear();
                      queryClient.clear();
                      window.location.href = "/login";
                    }}
                    className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-[15px] font-medium text-[#ef2f32] transition-colors hover:bg-[#fff5f5]"
                  >
                    <LogoutOutlined className="text-[18px]" />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

