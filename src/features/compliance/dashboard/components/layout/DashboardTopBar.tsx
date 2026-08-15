"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  BellOutlined,
  MenuOutlined,
  SettingOutlined,
  DownOutlined,
  UserOutlined,
  ApartmentOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type {
  DashboardPersona,
  ComplianceView,
} from "@/src/features/compliance/dashboard/types";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";

export type DashboardTopBarUser = {
  name: string;
  role: string;
  email: string;
  avatarSrc: string | null;
};

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
          "text-[13px] font-semibold tracking-[0.1em] ",
          online ? "text-[#15a93d]" : "text-[#9ca3af]"
        )}
      >
        {online ? "ONLINE" : "OFFLINE"}
      </span>
    </button>
  );
}

const FALLBACK_USER: DashboardTopBarUser = {
  name: "Loading...",
  role: "",
  email: "",
  avatarSrc: null,
};

export default function DashboardTopBar({
  persona,
  complianceView,
  onMenuNavigate,
  onOpenMobileNav,
  user = FALLBACK_USER,
}: {
  persona: DashboardPersona;
  complianceView?: ComplianceView;
  onMenuNavigate?: () => void;
  onOpenMobileNav?: () => void;
  user?: DashboardTopBarUser;
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const roleLabel = persona === "admin" ? "Admin" : user.role;
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
    setIsProfileMenuOpen((current) => !current);
  };

  return (
    <header className="relative z-40 border-b border-[#e9edf5] bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:px-8 xl:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eceef4] bg-[#f9fafc] text-[18px] text-[#2a3142] transition-colors hover:bg-white xl:hidden"
          >
            <MenuOutlined />
          </button>

          <div className="flex shrink-0 items-center gap-2 font-bungee xl:hidden">
            <Image
              src="/assets/images/logo.png"
              alt="Beldium"
              width={24}
              height={24}
            />
            <span className="hidden text-lg text-primary sm:inline">Beldium</span>
          </div>

          <div className="hidden items-center gap-3 xl:flex">
            <span className="text-[14px] font-medium text-[#5c6270]">Compliance Portal</span>
            {user.email ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[12px] font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Verified Compliance Partner
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-6">
          <div className=" lg:flex hidden items-center gap-2 rounded-full border border-[#e4e9f2] bg-[#f9fafb] px-3 py-1.5">
  <span className="text-[13px] text-[#707785]">Status</span>
  <OnlineToggle />
</div>

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

          <div
            className="relative"
            ref={profileMenuRef}
            onMouseEnter={() => setIsProfileMenuOpen(true)}
            onMouseLeave={() => setIsProfileMenuOpen(false)}
          >
            <button
              type="button"
              onClick={handleProfileMenuToggle}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full border border-[#edf1f7] bg-[#f5f7fb] px-2 py-2 text-left transition-colors hover:border-[#dfe5ef] hover:bg-white sm:gap-3 sm:px-3"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#e8ecf4] shadow-sm">
                {user.avatarSrc ? (
                  <Image
                    src={user.avatarSrc}
                    alt={user.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <UserOutlined className="text-[16px] text-[#7a8291]" />
                )}
              </div>
              <div className="hidden leading-tight sm:block">
                <div className="text-[12px] font-semibold text-[#1f2635]">
                  {user.name}
                </div>
                <div className="mt-1 text-[12px] text-[#7a8291]">{roleLabel}</div>
              </div>
              <DownOutlined
                className={classNames(
                  "ml-1 hidden text-[14px] text-[#4f5664] transition-transform sm:ml-2 sm:inline-block",
                  isProfileMenuOpen && "rotate-180",
                )}
              />
            </button>

            {isProfileMenuOpen ? (
              <div className="absolute right-0 top-full z-30 w-[min(310px,calc(100vw-2rem))] pt-2">
                <div className="overflow-hidden rounded-[20px] border border-[#e1e6ef] bg-white shadow-[0_30px_60px_-34px_rgba(16,30,61,0.38)]">
                  <div className="border-b border-[#edf1f7] px-5 py-4">
                    <div className="text-[16px] font-semibold text-[#1f2635]">
                      {user.name}
                    </div>
                    <div className="mt-1 text-[14px] text-[#6f7786]">
                      {user.role}
                    </div>
                    <div className="mt-1 text-[14px] text-[#7f8796]">
                      {user.email}
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
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

