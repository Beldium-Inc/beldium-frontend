import { Checkbox, Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "@/src/features/compliance/component/MobileTimeline";
import Logo from "@/src/features/onboard/component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { complianceOnboarding } from "@/src/features/onboarding/api";

export function StepSectorCoverage({
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
      formData.append("onboarding_step", "sector_coverages");
      const sectors = (values.sectorCoverage as string[]) || [];
      sectors.forEach((s) => formData.append("sector_coverage", s));
      await complianceOnboarding(formData);
      showToast("Saved sector coverage", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Failed to save sector coverage";
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
        <h5 className="title">Sector Coverage</h5>
        <p className="small-text">Industries and sectors you support.</p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item name="sectorCoverage" initialValue={[]}>
            <Checkbox.Group className="flex flex-col gap-4">
              <Checkbox value="Energy & Natural Resources">Energy & Natural Resources</Checkbox>
              <Checkbox value="Trade & Export Compliance">Trade & Export Compliance</Checkbox>
              <Checkbox value="Environmental & Social Governance">Environmental & Social Governance</Checkbox>
              <Checkbox value="Regulatory Advisory">Regulatory Advisory</Checkbox>
              <Checkbox value="Buyer Readiness & Documentation">Buyer Readiness & Documentation</Checkbox>
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
