// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Select } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StepHeader } from "../component/StepHeader";
import Logo from "../component/Logo";
import MobileTimeline from "../component/MobileTimeline";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";

export function StepTwo({
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
    const methodLabel = String(values.miningMethod || "");
    const statusLabel = String(values.operationStatus || "");
    const method =
      methodLabel === "Open pit"
        ? "open_pit"
        : methodLabel === "Shaft or Underground"
        ? "shaft_or_underground"
        : methodLabel === "Exploration"
        ? "exploration"
        : "";
    const status =
      statusLabel === "Active"
        ? "active"
        : statusLabel === "Developing"
        ? "developing"
        : statusLabel === "Temporarily inactive"
        ? "temporarily_inactive"
        : "";
    const formData = new FormData();
    formData.append("onboarding_step", "mining_operation_profile");
    formData.append("mineral_type", String(values.mineralType || ""));
    formData.append("mining_method", method);
    formData.append("depth_range", String(values.depthRange || values.deptRange || ""));
    formData.append("operational_status", status);
    await minerOnboarding(formData);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      await saveStep(values);
      showToast("Saved mining operation profile", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Failed to save mining operation profile";
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
      <StepHeader title="Mining Operation Profile" subtitle="Tell us what you do" />

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Mineral type"
            name="mineralType"
            rules={[
              {
                required: true,
                message: errorMsg("Mineral type required"),
              },
            ]}
          >
            <Input placeholder="Lithium" />
          </Form.Item>

          <Form.Item
            label="Mining method"
            name="miningMethod"
            rules={[
              {
                required: true,
                message: errorMsg("Please select your mining method"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Open pit">Open pit</Radio>
                <Radio value="Shaft or Underground">Shaft or Underground</Radio>
                <Radio value="Exploration">Exploration</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Depth range"
            name="depthRange"
            rules={[
              {
                required: true,
                message: errorMsg("Select your depth range"),
              },
            ]}
          >
            <Select placeholder="Select depth range">
              <Select.Option value="0m - 50m">0m - 50m</Select.Option>
              <Select.Option value="50m - 100m">50m - 100m</Select.Option>
              <Select.Option value="100m - 200m">100m - 200m</Select.Option>
              <Select.Option value="200m+">200m+</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Operation status"
            name="operationStatus"
            rules={[
              {
                required: true,
                message: errorMsg("Please select your mining method"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Active">Active</Radio>
                <Radio value="Developing">Developing</Radio>
                <Radio value="Temporarily inactive">Temporarily inactive</Radio>
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
