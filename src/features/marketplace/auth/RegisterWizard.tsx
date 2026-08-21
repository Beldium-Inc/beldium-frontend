"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarketplaceAuthShell from "./MarketplaceAuthShell";
import RoleStep from "./steps/RoleStep";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import SecureAccountStep, { SecureAccountValues } from "./steps/SecureAccountStep";
import {
  registerMarketplaceUser,
  MarketplaceRole,
  MarketplaceRegisterPersonalInfo,
} from "@/src/features/marketplace/auth/marketplace-auth-api";
import { showToast } from "@/src/store/toast.store";

type WizardStep = "personal" | "role" | "secure";

export default function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("personal");
  const [roles, setRoles] = useState<MarketplaceRole[]>([]);
  const [personalInfo, setPersonalInfo] = useState<MarketplaceRegisterPersonalInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSecureSubmit = async (values: SecureAccountValues) => {
    if (roles.length === 0 || !personalInfo) return;
    try {
      setSubmitting(true);
      await registerMarketplaceUser({
        roles,
        ...personalInfo,
        email: values.email,
        password: values.password,
      });
      showToast("Account created. Check your email for a verification code.", "success");
      router.push(`/marketplace/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error: unknown) {
      let msg = "Something went wrong creating your account.";
      if (typeof error === "object" && error && "response" in error) {
        const e = error as { response?: { data?: { message?: string } } };
        msg = e.response?.data?.message || msg;
      }
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarketplaceAuthShell showBackLink>
      {step === "personal" && (
        <PersonalInfoStep
          value={personalInfo}
          onContinue={(info) => {
            setPersonalInfo(info);
            setStep("role");
          }}
        />
      )}

      {step === "role" && (
        <RoleStep
          value={roles}
          onContinue={(r) => {
            setRoles(r);
            setStep("secure");
          }}
          onBack={() => setStep("personal")}
        />
      )}

      {step === "secure" && (
        <SecureAccountStep
          submitting={submitting}
          onSubmit={handleSecureSubmit}
          onBack={() => setStep("role")}
        />
      )}
    </MarketplaceAuthShell>
  );
}
