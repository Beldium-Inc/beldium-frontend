"use client";
import { ProfileOnboardWizard } from "@/src/features/onboard/ProfileOnboardWizard";
import { useProfileOnboardStore } from "@/src/features/onboard/profileOnboard.store";
import { useEffect, useState } from "react";
import { getUser } from "@/src/features/onboarding/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin } from "antd";
import Image from "next/image";

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
  const searchParams = useSearchParams();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const requestedStep = Number(searchParams.get("step"));
    const hasExplicitStep =
      Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 7;

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
          if (hasExplicitStep) {
            setStep(requestedStep);
            setBooting(false);
            return;
          }

          if (!profile) {
            setStep(1);
            setBooting(false);
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
  }, [setStep, router, searchParams]);
  const steps = titles.map((title, i) => {
    const id = i + 1;
    const status = id < step ? "completed" : id === step ? "active" : "pending";
    return { id, title, status };
  });

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50 flex items-center justify-center px-4 py-6 lg:py-10">
      <div className="w-full max-w-7xl h-full grid grid-cols-1 lg:grid-cols-[600px_1fr] gap-6 items-start">
        {/* left panel */}
        <div className="hidden lg:block h-full rounded-3xl bg-gradient-to-br from-gray-100 to-blue-50 p-10 px-16">
          <div className="h-16 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 ml-1">
            <Image src="/assets/images/logo.png" height={30} width={30} alt="Beldium logo" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Complete Your Profile</h2>

            <div className="flex flex-col">
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                return (
                  <div key={step.id} className="flex py-3 gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          step.status === "completed" || step.status === "active"
                            ? "bg-[#0B1B3F] border border-gray-400"
                            : "bg-white border border-gray-400"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <span className="text-white text-xs">✓</span>
                        ) : (
                          <div
                            className={`h-2 w-2 rounded-full ${
                              step.status === "active" ? "bg-white" : "bg-transparent"
                            }`}
                          />
                        )}
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-gray-800 border-1/2 mt-0 my-[-32px]" />}
                    </div>
                    <div className={isLast ? "pb-0" : "pb-8"}>
                      <div className="text-[11px] text-gray-400">Step {step.id}</div>
                      <div
                        className={`text-sm ${
                          step.status === "active" ? "font-semibold text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {step.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* right panel */}
        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-10 h-full overflow-y-auto flex flex-col justify-center">
          {booting ? (
            <div className="w-full flex justify-center items-center">
              <Spin size="small" />
            </div>
          ) : (
            <ProfileOnboardWizard />
          )}
        </div>
      </div>
    </div>
  );
}
