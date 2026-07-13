// Step1.tsx
import { Button, Form, Checkbox } from "antd";
import Image from "next/image";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";
import { StepHeader } from "../component/StepHeader";
import Logo from "../component/Logo";
import MobileTimeline from "../component/MobileTimeline";

export function StepComplete({
  data,
  onNext,
}: {
  data: unknown;
  onNext: () => void;
}) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successIcon = "/assets/icons/success-icon.svg";

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("onboarding_step", "declaration_authority");
      const agree = Boolean(values.agree);
      formData.append("agree_to_terms", agree ? "true" : "false");
      await minerOnboarding(formData);
      setSubmitted(true);
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Failed to submit declaration";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full py-10 flex flex-col items-center text-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 -m-10 bg-green-50 rounded-full blur-2xl opacity-60" />
          <Image src={successIcon} height={100} width={100} alt="" className="relative" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Your onboarding submission has been received</h2>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
            You are now in Beldium&apos;s onboarding pipeline. Compliance review and next steps will be communicated directly.
          </p>
        </div>
        <Button type="primary" size="large" onClick={() => router.push("/dashboard")}>
          Okay, continue
          <Image src="/assets/icons/arrow-white-icon.svg" height={20} width={20} alt="" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <LoadingOverlay visible={loading} message="Submitting..." />
      <Logo />
      <MobileTimeline />
      <StepHeader title="Declaration & Authority" subtitle="Confirm your submission and consent to compliance verification" />

      <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
        <p className="text-sm font-medium text-gray-900 mb-2">Statement</p>
        <p className="text-sm text-gray-600 mb-4">
          I declare that the information provided is accurate to the best of my knowledge and I consent to Beldium
          conducting compliance verification as required.
        </p>

        <Form.Item name="agree" valuePropName="checked" rules={[{ required: true, message: "You must agree to continue" }]}>
          <Checkbox>I agree</Checkbox>
        </Form.Item>

        <div className={clsx("mt-3 flex w-full gap-3")}>
          <Button type="primary" htmlType="submit" size="large" className={clsx(" w-[60%] py-5 h-20 mb-1 text-white")}>
            Submit for review
            <Image src="/assets/icons/arrow-white-icon.svg" height={20} width={20} alt="" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Our team will review your submission and contact you within 72 hours.
        </p>
      </Form>
    </div>
  );
}
