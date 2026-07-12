import { Button, Form, Checkbox } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StepHeader } from "../component/StepHeader";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";

export function StepSix({
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
    formData.append("onboarding_step", "compliance_support_opt_in");
    const selected = (values.supportAreas as string[]) || [];
    if (selected && selected.length) {
      selected.forEach((item) =>
        formData.append("areas_of_compliance_support", item)
      );
    } else {
      formData.append("areas_of_compliance_support", "");
    }
    await minerOnboarding(formData);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      await saveStep(values);
      showToast("Saved compliance support preferences", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message ||
        "Failed to save compliance support preferences";
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
      <StepHeader
        title="Compliance Support Opt-In"
        subtitle="Choose the areas where you’d like Beldium’s support"
      />

      <div className="w-full flex flex-col gap-6">
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={handleSubmit}
        >
          <Form.Item name="supportAreas" initialValue={[]} >
            <Checkbox.Group className="flex flex-col gap-4">
              <Checkbox value="Regulatory advisory support">
                Regulatory advisory support
              </Checkbox>
              <Checkbox value="Environmental compliance support">
                Environmental compliance support
              </Checkbox>
              <Checkbox value="ESG & traceability onboarding">
                ESG & traceability onboarding
              </Checkbox>
              <Checkbox value="Buyer readiness & documentation">
                Buyer readiness & documentation
              </Checkbox>
            </Checkbox.Group>
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
                {exiting ? "Saving..." : "Save and Exit"}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
