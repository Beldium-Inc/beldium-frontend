"use client";

import { useState } from "react";
import { UserOutlined, DownloadOutlined } from "@ant-design/icons";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { accountSettings, companySettings } from "./data";

const TABS = ["Account", "Company details", "Team members", "Notification preferences"] as const;
type Tab = (typeof TABS)[number];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-[#293041]">{label}</label>
      <input
        defaultValue={value}
        className="mt-1.5 w-full border border-[#dbe0ea] rounded-lg px-3 py-2.5 text-sm text-[#293041] outline-none focus:border-[#101e3d]"
      />
    </div>
  );
}

function AccountTab() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <label className="text-sm text-[#293041]">Photo</label>
        <div className="mt-2 w-20 h-20 rounded-full bg-[#f0f2f6] flex items-center justify-center text-[#c3c9d4] text-2xl">
          <UserOutlined />
        </div>
      </div>

      <Field label="Full name" value={accountSettings.fullName} />
      <Field label="Work email" value={accountSettings.workEmail} />
      <div>
        <Field label="Phone number" value={accountSettings.phoneNumber} />
        <p className="text-xs text-[#8b93a1] mt-1.5 text-right">User ID: {accountSettings.userId}</p>
      </div>

      <hr className="border-[#edf1f7]" />

      <div>
        <h3 className="text-sm font-semibold text-[#172554] mb-3">System preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#293041]">Language</label>
            <select
              defaultValue={accountSettings.language}
              className="mt-1.5 w-full border border-[#dbe0ea] rounded-lg px-3 py-2.5 text-sm text-[#293041] outline-none focus:border-[#101e3d]"
            >
              <option>English</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-[#293041]">Theme</label>
            <select
              defaultValue={accountSettings.theme}
              className="mt-1.5 w-full border border-[#dbe0ea] rounded-lg px-3 py-2.5 text-sm text-[#293041] outline-none focus:border-[#101e3d]"
            >
              <option>System</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-[#edf1f7]" />

      <div>
        <h3 className="text-sm font-semibold text-[#172554] mb-3">Security</h3>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[#293041]">Password</div>
            <p className="text-xs text-[#8b93a1] mt-1 max-w-sm">
              Update your password using the button below. You&apos;ll be redirected to a secure page to create your
              new password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => showToast("Settings aren't connected to the backend yet.", "info")}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#dbe0ea] px-4 py-2 text-sm font-medium text-[#293041] hover:bg-[#f9fafc]"
          >
            Set new password <DownloadOutlined />
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 mt-5">
          <div>
            <div className="text-sm font-medium text-[#293041]">Two-factor authentication (2FA)</div>
            <p className="text-xs text-[#8b93a1] mt-1 max-w-sm">
              Enable two factor authentication to add an extra layer of security to your account. When you login
              we&apos;ll send you a 6-digit code to your email that you will have to enter to verify its you
            </p>
          </div>
          <button
            type="button"
            onClick={() => showToast("Settings aren't connected to the backend yet.", "info")}
            className="shrink-0 w-11 h-6 rounded-full bg-[#101e3d] relative"
          >
            <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <label className="text-sm text-[#293041]">Logo</label>
        <div className="mt-2 w-20 h-20 rounded-lg bg-[#f0f2f6]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Company name" value={companySettings.companyName} />
        <Field label="Company phone number" value={companySettings.companyPhone} />
        <Field label="Company email" value={companySettings.companyEmail} />
        <Field label="Business registration NO." value={companySettings.registrationNumber} />
      </div>
    </div>
  );
}

export default function SettingsView() {
  const [tab, setTab] = useState<Tab>("Account");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Settings</h1>
        <p className="text-sm text-[#8b93a1] mt-1">Manage profile and security settings</p>
      </div>

      <div className="flex items-center gap-6 border-b border-[#edf1f7]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={classNames(
              "pb-3 text-sm -mb-px border-b-2",
              tab === t ? "border-[#101e3d] text-[#101e3d] font-medium" : "border-transparent text-[#8b93a1]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Account" && <AccountTab />}
      {tab === "Company details" && <CompanyTab />}
      {(tab === "Team members" || tab === "Notification preferences") && (
        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-10 text-center text-[#8b93a1]">
          {tab}: not connected to a backend yet, coming soon.
        </div>
      )}
    </div>
  );
}
