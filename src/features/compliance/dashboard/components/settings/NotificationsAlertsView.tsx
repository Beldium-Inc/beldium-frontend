"use client";

import { useState } from "react";
import { SaveOutlined, MailOutlined, FileSearchOutlined } from "@ant-design/icons";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { ComplianceSettingsBreadcrumbs } from "@/src/features/compliance/dashboard/components/settings/shared";

export default function NotificationsAlertsView() {
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [emailAlertPreference, setEmailAlertPreference] = useState<
    "all" | "high-risk" | "assigned"
  >("all");

  const handleSaveChanges = () => {
    showToast("Mock notification preferences saved locally. API integration pending.", "success");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <ComplianceSettingsBreadcrumbs currentLabel="Notifications & Alerts" />

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-0.06em] text-[#2a2f39]">
              Notifications &amp; Alerts
            </h1>
            <p className="mt-2 max-w-[760px] text-[15px] text-[#7a8291]">
              Configure how compliance events are communicated and escalated
              across the system.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            className="inline-flex h-14 items-center gap-3 rounded-[18px] bg-[#14244a] px-6 text-[16px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-colors hover:bg-[#182c57]"
            style={primaryActionStyle}
          >
            <SaveOutlined />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid max-w-[1100px] gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <section className="rounded-[24px] border border-[#dbe2ee] bg-white px-6 py-6 shadow-[0_24px_50px_-44px_rgba(16,30,61,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 text-[18px] font-medium text-[#2a2f39]">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f7f9fc] text-[20px] text-[#2a2f39]">
                <MailOutlined />
              </span>
              Email Notifications
            </div>

            <button
              type="button"
              onClick={() =>
                setEmailNotificationsEnabled((current) => !current)
              }
              className={classNames(
                "relative inline-flex h-9 w-[68px] rounded-full border transition-colors",
                emailNotificationsEnabled
                  ? "border-[#14244a] bg-[#14244a]"
                  : "border-[#dbe2ee] bg-[#edf1f6]",
              )}
              aria-pressed={emailNotificationsEnabled}
              aria-label="Toggle email notifications"
            >
              <span
                className={classNames(
                  "absolute top-1 inline-flex h-7 w-7 rounded-full bg-white shadow-[0_6px_18px_-10px_rgba(16,30,61,0.45)] transition-all",
                  emailNotificationsEnabled ? "right-1" : "left-1",
                )}
              />
            </button>
          </div>

          <div
            className={classNames(
              "mt-6 space-y-4 transition-opacity",
              !emailNotificationsEnabled && "opacity-45",
            )}
          >
            {[
              { id: "all", label: "All alerts" },
              { id: "high-risk", label: "High-risk only" },
              { id: "assigned", label: "Assigned cases only" },
            ].map((option) => {
              const checked = emailAlertPreference === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setEmailAlertPreference(
                      option.id as "all" | "high-risk" | "assigned",
                    )
                  }
                  disabled={!emailNotificationsEnabled}
                  className="flex items-center gap-3 text-left disabled:cursor-not-allowed"
                >
                  <span
                    className={classNames(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                      checked
                        ? "border-[#14244a] bg-white"
                        : "border-[#a8b2c3] bg-white",
                    )}
                  >
                    <span
                      className={classNames(
                        "h-3.5 w-3.5 rounded-full transition-colors",
                        checked ? "bg-[#14244a]" : "bg-transparent",
                      )}
                    />
                  </span>
                  <span className="text-[16px] font-medium text-[#5d6675]">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[24px] border-[3px] border-[#7386aa] bg-white px-6 py-6 shadow-[0_24px_50px_-44px_rgba(16,30,61,0.35)]">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f7f9fc] text-[22px] text-[#2e3441]">
              <FileSearchOutlined />
            </span>
            <div className="min-w-0">
              <div className="text-[17px] font-semibold text-[#2a2f39]">
                Export &amp; Trade Documentation
              </div>
              <div className="mt-1 text-[14px] leading-6 text-[#8a92a1]">
                Rules regulating mineral export documentation and authorization
              </div>
            </div>
          </div>

          <div className="mt-6 h-px bg-[#e7ebf2]" />

          <div className="mt-5 inline-flex items-center gap-2 text-[14px] text-[#8a92a1]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1fb538]" />
            <span>7 active rules</span>
          </div>
        </section>
      </div>
    </div>
  );
}

