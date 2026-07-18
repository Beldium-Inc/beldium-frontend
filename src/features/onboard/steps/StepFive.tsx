// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Button, Form, Radio } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StepHeader } from "../component/StepHeader";
import Logo from "../component/Logo";
import MobileTimeline from "../component/MobileTimeline";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";

export function StepFive({
  data,
  onNext,
}: {
  data: unknown;
  onNext: () => void;
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  const saveStep = async (values: Record<string, unknown>) => {
    const formData = new FormData();
    formData.append("onboarding_step", "production_supply_signals");
    formData.append(
      "estimated_monthly_output",
      String(values.estimatedMonthlyOutput || "")
    );
    formData.append(
      "processing_stages",
      String(values.processingStage || "")
    );
    const logisticsLabel = String(values.logisticsAccess || "");
    const logistics =
      logisticsLabel === "Road"
        ? "road"
        : logisticsLabel === "Rail"
        ? "rail"
        : logisticsLabel === "Port access planned"
        ? "port_access_planned"
        : "";
    formData.append("logistics_access", logistics || String(values.logisticsAccess || ""));
    await minerOnboarding(formData);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      await saveStep(values);
      showToast("Saved production & supply signals", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message ||
        "Failed to save production & supply signals";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      const values = await form.validateFields();
      setExiting(true);
      await saveStep(values);
      showToast("Progress saved. You can resume anytime.", "success");
      router.push("/dashboard");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } }; errorFields?: unknown };
      if (e?.errorFields) return;
      const msg = e?.response?.data?.message || "Failed to save progress";
      showToast(msg, "error");
    } finally {
      setExiting(false);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay visible={loading} message="Saving..." />
      <Logo />
      <MobileTimeline />
      <StepHeader
        title="Production & Supply Signals"
        subtitle="Provide operational details to guide buyer and logistics matching"
      />

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Estimated Monthly Output Range"
            name="estimatedMonthlyOutput"
            rules={[
              {
                required: true,
                message: errorMsg("Please select your estimated monthly output range"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="< 50 tons">&lt; 50 tons</Radio>
                <Radio value="50–200 tons">50–200 tons</Radio>
                <Radio value=">200 tons">&gt;200 tons</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Processing stage"
            name="processingStage"
            rules={[
              {
                required: true,
                message: errorMsg("Please select your processing stage"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Raw ore">Raw ore</Radio>
                <Radio value="Concentrate">Concentrate</Radio>
                <Radio value="Not yet processed">Not yet processed</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Logistics access"
            name="logisticsAccess"
            rules={[
              {
                required: true,
                message: errorMsg("Please select your logistics access"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Road">Road</Radio>
                <Radio value="Rail">Rail</Radio>
                <Radio value="Port access planned">Port access planned</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <div className="md:flex items-center gap-10">
            <div>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                >
                  Save and Continue
                  <Image
                    src="/assets/icons/arrow-white-icon.svg"
                    height={20}
                    width={20}
                    alt="logo"
                  />
                </Button>
              </Form.Item>
            </div>
            <div>
              <button
                type="button"
                onClick={handleSaveAndExit}
                disabled={exiting}
                className="text-sm flex justify-center md:block text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
              >
                {exiting ? "Saving..." : "Save Progress"}
              </button>
              <p className="text-xs text-gray-500 flex justify-center md:block mt-1">
                You can continue later
              </p>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
