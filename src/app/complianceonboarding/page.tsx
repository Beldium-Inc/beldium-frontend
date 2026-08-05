"use client";
import { ComplianceOnboardWizard } from "@/src/features/compliance/ComplianceOnboardWizard";
import { useComplianceOnboardStore } from "@/src/features/compliance/complianceOnboard.store";
import { useEffect, useRef, useState } from "react";
import { getUser } from "@/src/features/onboarding/api";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import Image from "next/image";

const titles = [
  "Organization Identity",
  "Online Presence",
  "Authorized Representative",
  "Sector Coverage",
  "Regulatory Bodies Interface",
  "Compliance Functions",
  "Experience & Capacity",
  "Role Confirmation",
];

export default function Page() {
  const { step, setStep } = useComplianceOnboardStore();
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const scrollPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollPanelRef.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step, booting]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getUser();
        const completed = Boolean(res?.data?.has_completed_onboarding);
        const profile = res?.data?.profile || null;
        if (completed) {
          router.replace("/compliancedashboard?persona=admin");
        } else {
          if (!profile) {
            setStep(1);
          } else {
            const current = String(profile?.compliance_profile_onboarding_step || "");
            const order = [
              "organization_identity",
              "online_presence",
              "authorized_representative",
              "sector_coverages",
              "regulatory_bodies_interface",
              "compliance_functions",
              "experience_and_capacity",
              "role_confirmation",
            ];
            const idx = order.indexOf(current);
            if (current === "role_confirmation") {
              setStep(8);
            } else if (idx >= 0) {
              setStep(idx + 2);
            } else {
              setStep(1);
            }
          }
        }
      } catch {
        setStep(1);
      } finally {
        setBooting(false);
      }
    };
    init();
  }, [setStep, router]);

  const steps = titles.map((title, i) => {
    const id = i + 1;
    let status: "completed" | "active" | "pending" = "pending";
    if (id < step) status = "completed";
    if (id === step) status = "active";
    return { id, title, status };
  });

  return (
    <div className="relative w-full h-screen flex justify-between items-center">
      <div className="hidden lg:block text-primary w-1/2 h-screen bg-gradient-to-tl from-slate-400 from-0% via-sky-50 via-50% to-slate-50 to-100% rounded-2xl">
        <div className="flex flex-col items-center justify-center h-full w-full  p-25">
          <div className="rounded-xl w-full shawdow1 transparent p-2  shadow-sm ">
            <div className="h-16 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 ml-1">
              <Image src="/assets/images/logo.png" height={30} width={30} alt="Beldium logo" />
            </div>
            <div className="w-full  flex flex-col gap-6 p-6 bg-white rounded-2xl">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Complete Your Profile</h2>
              <div className="flex flex-col">
                {steps.map((s, index) => {
                  const isLast = index === steps.length - 1;
                  return (
                    <div key={s.id} className="flex py-3 gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            s.status === "completed"
                              ? "bg-[#0B1B3F] border border-[#0B1B3F] shadow-[0_2px_6px_rgba(11,27,63,0.35)] scale-105"
                              : s.status === "active"
                              ? "bg-white border-2 border-[#0B1B3F]"
                              : "bg-white border border-gray-300"
                          }`}
                        >
                          {s.status === "completed" ? (
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            >
                              <path
                                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${
                                s.status === "active" ? "bg-[#0B1B3F]" : "bg-transparent"
                              }`}
                            />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-px flex-1 mt-0 my-[-32px] ${
                              s.status === "completed" ? "bg-[#0B1B3F]" : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                      <div className={isLast ? "pb-0" : "pb-8"}>
                        <div className="text-[11px] text-gray-400">Step {s.id}</div>
                        <div
                          className={`text-sm ${
                            s.status === "active" ? "font-semibold text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {s.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={scrollPanelRef}
        className="w-full h-screen bg-white lg:w-1/2 flex flex-col gap-6 justify-start lg:justify-center overflow-y-scroll py-15"
      >
        {booting ? (
          <div className="w-full flex justify-center items-center">
            <Spin size="small" />
          </div>
        ) : (
          <ComplianceOnboardWizard />
        )}
      </div>
    </div>
  );
}
