import { Checkbox, Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "@/src/features/compliance/component/MobileTimeline";
import Logo from "@/src/features/onboard/component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { complianceOnboarding } from "@/src/features/onboarding/api";

export function StepRegBodies({
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
      formData.append("onboarding_step", "regulatory_bodies_interface");
      const bodies = (values.regulatoryBodies as string[]) || [];
      formData.append("regulatory_body_interface", JSON.stringify(bodies));
      await complianceOnboarding(formData);
      showToast("Saved regulatory bodies interface", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message || "Failed to save regulatory bodies interface";
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
        <h5 className="title">Regulatory Bodies Interface</h5>
        <p className="small-text">Agencies you interface with.</p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item name="regulatoryBodies" initialValue={[]}>
            <Checkbox.Group className="flex flex-col gap-4">
              <Checkbox value="Ministry of Mines & Steel Development">Ministry of Mines & Steel Development</Checkbox>
              <Checkbox value="Nigeria Geological Survey Agency (NGSA)">Nigeria Geological Survey Agency (NGSA)</Checkbox>
              <Checkbox value="Nigeria Export Promotion Council (NEPC)">Nigeria Export Promotion Council (NEPC)</Checkbox>
              <Checkbox value="Nigeria Customs Service (NCS)">Nigeria Customs Service (NCS)</Checkbox>
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
