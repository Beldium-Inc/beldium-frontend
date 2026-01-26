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
import { PasswordRules } from "@/components/ui/PasswordRules";
import { useRouter } from "next/navigation";

export function StepTwo({
  data,
  onNext,
  onBack,
}: {
  data: any;
  onNext: any;
  onBack: any;
}) {
  const router = useRouter();
  const { step, totalSteps } = useOnboardingStore();
  const { alertModalOpen, openAlertModal, closeAlertModal } = useUIStore();
  const [form] = Form.useForm();
  const [password, setPassword] = useState("");
  const successIcon = "/assets/icons/success-icon.svg";

  return (
    <div className="w-full py-10 flex flex-col gap-5">
      <div className="flex flex-col items-center text-center gap-4">
        {/* {ICON_MAP[type]} */}
        <Image src={successIcon} height={120} width={120} alt="logo" />

        <h2 className="text-lg font-bold!">
          {"You email address has been verified successfully"}
        </h2>

        <p className="text-sm text-gray-600">
          {
            "You are now in Beldium’s onboarding pipeline.  Compliance review and next steps will be communicated directly."
          }
        </p>

        <div className={clsx("mt-3 flex w-full gap-3")}>
          <Button
            type="primary"
            onClick={() => router.push("/")}
            className={clsx("w-full py-5! text-white")}
          >
            Okay continue
            <Image
              src="/assets/icons/arrow-white-icon.svg"
              height={20}
              width={20}
              alt="logo"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
