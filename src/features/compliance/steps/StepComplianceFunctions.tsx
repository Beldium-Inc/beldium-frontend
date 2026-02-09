import { Checkbox, Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "@/src/features/compliance/component/MobileTimeline";
import Logo from "@/src/features/onboard/component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { complianceOnboarding } from "@/src/features/onboarding/api";

export function StepComplianceFunctions({
  data,
  onNext,
}: {
  data: unknown;
  onNext: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("onboarding_step", "compliance_functions");
      const funcs = (values.functions as string[]) || [];
      funcs.forEach((f) => formData.append("compliance_functions", f));
      await complianceOnboarding(formData);
      showToast("Saved compliance functions", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Failed to save compliance functions";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay visible={loading} message="Saving..." />
      <Logo />
      <div>
        <MobileTimeline />
      </div>
      <div className="">
        <h5 className="title">Compliance Functions</h5>
        <p className="small-text">Services you provide to clients.</p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item name="functions" initialValue={[]}>
            <Checkbox.Group className="flex flex-col gap-4">
              <Checkbox value="Advisory">Advisory</Checkbox>
              <Checkbox value="Lead Counsel">Lead Counsel</Checkbox>
              <Checkbox value="Ongoing Compliance Partner">Ongoing Compliance Partner</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <div className="md:flex items-center gap-10">
            <div>
              <Form.Item>
                <Button
                  onClick={() => form.submit()}
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
              <p className="text-sm flex justify-center md:block">
                <Link href="/">Save and Exit</Link>
              </p>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
