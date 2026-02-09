import { Button, Form, Checkbox } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "../component/MobileTimeline";
import Logo from "../component/Logo";
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
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

  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay visible={loading} message="Saving..." />
      <Logo />
      <div>
        <MobileTimeline />

      </div>

      <div className="">
        <h5 className="title">Compliance Support Opt-In</h5>
        <p className="small-text">
          Choose the areas where you’d like Beldium’s support
        </p>
      </div>

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
