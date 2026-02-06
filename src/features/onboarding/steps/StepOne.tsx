// Step1.tsx
import { Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useOnboardingStore } from "../onboarding.store";
import clsx from "clsx";
import OtpInputField from "@/src/components/ui/OtpInputField";
import { useEffect, useState } from "react";
import { resendOtp, verifyAccount } from "../api";
import { showToast } from "@/src/store/toast.store";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";

export function StepOne({
  data,
  onNext,
  onBack,
}: {
  data: { email: string };
  onNext: () => void;
  onBack: () => void;
}) {
  const { step, totalSteps } = useOnboardingStore();
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const canResend = timeLeft === 0;
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = async () => {
    try {
      if (!code || code.length !== 6) {
        showToast("Enter the 6-digit code", "error");
        return;
      }
      setVerifying(true);
      await verifyAccount({ email: data?.email, verification_code: code });
      showToast("Account verified successfully", "success");
      onNext();
    } catch (error: unknown) {
      let msg = "Verification failed. Please try again.";
      if (typeof error === "object" && error && "response" in error) {
        const e = error as { response?: { data?: { message?: string } } };
        msg = e.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message || msg;
      }
      showToast(msg, "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      if (!canResend) return;
      setResending(true);
      await resendOtp({ email: data?.email });
      showToast("Verification code resent", "success");
      setTimeLeft(30);
    } catch (error: unknown) {
      let msg = "Could not resend code.";
      if (typeof error === "object" && error && "response" in error) {
        const e = error as { response?: { data?: { message?: string } } };
        msg = e.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message || msg;
      }
      showToast(msg, "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full py-10 flex flex-col gap-5">
      <div className="w-full flex mb-8 justify-between items-center">
        <Button type="text" onClick={onBack}>
          <Image
            src="/assets/icons/arrow-icon.svg"
            height={24}
            width={24}
            alt="logo"
          />
        </Button>
        <div className="flex gap-4 items-start">
          {Array(totalSteps)
            ?.fill(step)
            .map((_, index) => (
              <span
                key={index}
                className={clsx(
                  "h-2! w-18 bg-gray-300 rounded-lg",
                  index <= step - 1 && "bg-primary",
                )}
              ></span>
            ))}
        </div>
      </div>
      <div className="text-center">
        <h2 className="font-semibold! text-xl">Verify your email address</h2>
        <p className="text-sm text-gray-500">
          Enter the code we sent to confirm your email account.
        </p>
      </div>
      <Form layout="vertical" className="w-full">
        <OtpInputField
          length={6}
          onComplete={(otp) => setCode(otp)}
        />
      </Form>
      <div className="flex flex-col gap-4">
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          onClick={handleVerify}
          loading={verifying}
        >
          Verify account{" "}
          <Image
            src="/assets/icons/arrow-white-icon.svg"
            height={20}
            width={20}
            alt="logo"
          />
        </Button>

        <Button
          type="default"
          htmlType="submit"
          block
          size="large"
          onClick={handleResend}
          disabled={!canResend}
          className="text-sm!"
          loading={resending}
        >
          {`Didn’t receive a code? Resend in ${timeLeft || 30} seconds`}
        </Button>
        <LoadingOverlay visible={verifying} message="Verifying your account..." />
        <p className="text-sm">
          Wrong number or email?. <Link href="/">Edit details</Link>
        </p>
      </div>
    </div>
  );
}
