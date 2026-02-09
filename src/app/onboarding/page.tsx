"use client";
import { ProfileOnboardWizard } from "@/src/features/onboard/ProfileOnboardWizard";
import { useProfileOnboardStore } from "@/src/features/onboard/profileOnboard.store";
import { useEffect, useState } from "react";
import { getUser } from "@/src/features/onboarding/api";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

const titles = [
  "Miner Identity",
  "Mining Operation Profile",
  "Licensing & Regulatory Status",
  "Environmental & ESG Readiness",
  "Production & Supply Signals",
  "Compliance Support Opt-In",
  "Declaration & Authority",
];

export default function Page() {
  const { step, setStep } = useProfileOnboardStore();
  const router = useRouter();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getUser();
        const completed = Boolean(res?.data?.has_completed_onboarding);
        const profile = res?.data?.profile || null;
        if (completed) {
          const role = res?.data?.role;
          if (role === "Compliance") {
            router.replace("/compliancedashboard");
          } else {
            router.replace("/dashboard");
          }
        } else {
          if (!profile) {
            setStep(1);
            return;
          }
          const current = String(profile?.miner_profile_onboarding_step || "");
          const order = [
            "miner_identity",
            "mining_operation_profile",
            "licensing_regulatory_status",
            "environmental_esg",
            "production_supply_signals",
            "compliance_support_opt_in",
            "declaration_authority",
          ];
          const idx = order.indexOf(current);
          if (current === "declaration_authority") {
            setStep(7);
          } else if (idx >= 0) {
            setStep(idx + 2);
          } else {
            setStep(1);
          }
        }
      } catch {
        setStep(1);
      }
      setBooting(false);
    };
    init();
  }, [setStep, router]);
  const steps = titles.map((title, i) => {
    const id = i + 1;
    const status = id < step ? "completed" : id === step ? "active" : "pending";
    return { id, title, status };
  });

  return (
    <div className="relative w-full h-screen flex justify-between items-center">
      {/* left panel */}
      <div className="hidden lg:block text-primary w-1/2 h-screen bg-gradient-to-tl from-slate-400 from-0% via-sky-50 via-50% to-slate-50 to-100% rounded-2xl">
        <div className="flex flex-col items-center justify-center h-full w-full  p-25">
          <div className="rounded-xl w-full shawdow1 transparent p-2  shadow-sm ">
            <div className="w-full  flex flex-col gap-6 p-6 bg-white rounded-2xl">
              <h2 className="mb-6  text-sm font-semibold">Complete Your Profile</h2>

              <div className="relative">
                <div className="absolute left-[11px] top-0 h-full w-px bg-gray-200" />

                <div className="space-y-6">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="relative z-10">
                        {step.status === "completed" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f172a] text-white">
                            ✓
                          </div>
                        )}

                        {step.status === "active" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0f172a]">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#0f172a]" />
                          </div>
                        )}

                        {step.status === "pending" && (
                          <div className="h-6 w-6 rounded-full border border-gray-300 bg-white" />
                        )}
                      </div>

                      <div>
                        <p className="text-[11px] text-gray-400">Step {step.id}</p>
                        <p className="text-sm text-gray-900">{step.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* right panel  */}
      <div className="w-full h-screen lg:w-1/2 flex flex-col gap-6 justify-center overflow-y-scroll py-15">
        {booting ? (
          <div className="w-full flex justify-center items-center">
            <Spin size="small" />
          </div>
        ) : (
          <ProfileOnboardWizard />
        )}
      </div>
    </div>
  );
}
