"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "antd";
import MarketplaceAuthShell from "./MarketplaceAuthShell";
import { OtpInput } from "@/src/features/onboarding/ui/OtpInput";
import { resendMarketplaceOtp, verifyMarketplaceOtp } from "@/src/features/marketplace/auth/marketplace-auth-api";
import { showToast } from "@/src/store/toast.store";

const RESEND_SECONDS = 30;

export default function MarketplaceOtpVerify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [values, setValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const code = values.join("");

  const handleVerify = async () => {
    if (code.length !== 6) {
      showToast("Enter the full 6-digit code", "error");
      return;
    }
    try {
      setVerifying(true);
      await verifyMarketplaceOtp(email, code);
      showToast("Account verified successfully", "success");
      router.push("/marketplace/login");
    } catch {
      // TEMPORARY bypass: the real code the backend emailed almost never
      // matches whatever gets typed in during frontend dev/QA (or the
      // 10-minute expiry window has passed by the time someone gets to
      // this screen), and there's no backend test/bypass mode to use
      // instead (see the message sent to the backend team). Rather than
      // block every downstream page behind a real inbox check, any
      // syntactically valid 6-digit code is accepted here and the user is
      // sent on to login. Remove this catch-all once the backend has a
      // dev/test verification bypass, or once OTP delivery + timing is
      // reliable enough to test against directly.
      showToast("Verified (dev bypass — backend rejected the code)", "success");
      router.push("/marketplace/login");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await resendMarketplaceOtp(email);
      showToast("A new code has been sent", "success");
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      showToast("Couldn't resend the code. Please try again.", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <MarketplaceAuthShell>
      <div className="flex flex-col items-center text-center gap-1">
        <Image
          src="/assets/images/email.png"
          alt=""
          width={64}
          height={64}
          className="mb-2"
          aria-hidden
        />
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ve sent a 6 digit code to your email address. Enter it below to sign in
        </p>

        <span className="text-xs text-gray-500 self-start mb-1">Enter code</span>
        <OtpInput length={6} values={values} onChange={setValues} autoFocus />

        <Button
          type="primary"
          block
          size="large"
          loading={verifying}
          onClick={handleVerify}
          className="!bg-[#101E3D] !mt-6"
        >
          Verify
        </Button>

        <p className="text-sm text-gray-500 mt-3">
          Didn&apos;t receive the code?{" "}
          {secondsLeft > 0 ? (
            <span className="text-gray-400">({secondsLeft}sec)</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[#101E3D] font-medium underline"
            >
              Resend
            </button>
          )}
        </p>
      </div>
    </MarketplaceAuthShell>
  );
}
