"use client";
import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function VerifySuccess({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const router = useRouter();

  return (
    <div className="w-full py-10 flex flex-col gap-6">
      <div className="w-full flex mb-8 justify-between items-center">
        <Button type="text" onClick={onBack}>
          <Image src="/assets/icons/arrow-icon.svg" height={24} width={24} alt="back" />
        </Button>
        <Image src="/assets/images/logo.png" height={36} width={36} alt="logo" />
      </div>

      <div className="flex flex-col items-center text-center gap-6">
        <Image src="/assets/icons/success-icon.svg" height={100} width={100} alt="success" />
        <h2 className="text-xl font-semibold">Your account has been verified successfully</h2>
        <p className="text-sm text-gray-500 max-w-lg">
          You are now in Beldium&apos;s onboarding pipeline. Compliance review and next steps will be
          communicated directly.
        </p>
        <Button
          type="primary"
          size="large"
          className="w-full max-w-sm"
          onClick={() => {
            router.push("/login");
            onContinue();
          }}
        >
          Okay, continue
          <Image src="/assets/icons/arrow-white-icon.svg" height={20} width={20} alt="arrow" />
        </Button>
      </div>
    </div>
  );
}
