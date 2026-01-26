// Step1.tsx
import { AmountInput } from "@/components/ui/AmountInput";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { COUNTRIES } from "@/constants";
import { Input, Button, Form, Checkbox, Modal } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useOnboardingStore } from "../onboarding.store";
import clsx from "clsx";
import NotificationModal from "@/components/ui/modals/NotificationModal";
import { useUIStore } from "@/store/ui/ui.store";
import OtpInputField from "@/components/ui/OtpInputField";

export function StepOne({
  data,
  onNext,
  onBack,
}: {
  data: any;
  onNext: any;
  onBack: any;
}) {
  const { step, totalSteps } = useOnboardingStore();
  const [form] = Form.useForm();

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
          length={4}
          onComplete={(otp) => {
            console.log("OTP entered:", otp);
          }}
        />
      </Form>
      <div className="flex flex-col gap-4">
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          onClick={onNext}
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
          onClick={onNext}
          className="text-sm!"
        >
          Didn’t receive a code? Resend in 30 seconds
        </Button>
        <p className="text-sm">
          Wrong number or email?. <Link href="/">Edit details</Link>
        </p>
      </div>
    </div>
  );
}
