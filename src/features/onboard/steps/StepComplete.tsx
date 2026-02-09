// Step1.tsx
import { Button, Form, Checkbox } from "antd";
import Image from "next/image";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";

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
  const successIcon = "/assets/icons/success-icon.svg";
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("onboarding_step", "declaration_authority");
      const agree = Boolean(values.agree);
      formData.append("agree_to_terms", agree ? "true" : "false");
      await minerOnboarding(formData);
      const fin = new FormData();
      fin.append("onboarding_step", "completed");
      await minerOnboarding(fin);
      showToast("Submission received. We will contact you within 72 hours.", "success");
      router.push("/dashboard");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Failed to submit declaration";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-10 flex flex-col gap-5">
      <LoadingOverlay visible={loading} message="Submitting..." />
      <div className="flex flex-col items-start gap-6">
        <Image src={successIcon} height={36} width={36} alt="logo" />

        <div>
          <h5 className="title">Declaration & Authority</h5>
          <p className="small-text">
            Confirm your submission and consent to compliance verification
          </p>
        </div>

        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item name="agree" valuePropName="checked">
            <Checkbox>I agree</Checkbox>
          </Form.Item>

          <div className={clsx("mt-3 flex w-full gap-3")}>
            <Button
              type="primary"
              onClick={() => form.submit()}
              className={clsx("w-full py-5! text-white")}
            >
              Submit for review
              <Image
                src="/assets/icons/arrow-white-icon.svg"
                height={20}
                width={20}
                alt="logo"
              />
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Our team will review your submission and contact you within 72 hours.
          </p>
        </Form>
      </div>
    </div>
  );
}
