import { Checkbox, Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "@/src/features/compliance/component/MobileTimeline";
import Logo from "@/src/features/onboard/component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { complianceOnboarding } from "@/src/features/onboarding/api";
import { useRouter } from "next/navigation";

export function StepRoleConfirm({
  data,
  onNext,
}: {
  data: unknown;
  onNext: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const accepted = Array.isArray(values.agree) && values.agree.includes("agree");
      const formData = new FormData();
      formData.append("onboarding_step", "role_confirmation");
      formData.append("role_confirmation", String(Boolean(accepted)));
      await complianceOnboarding(formData);
      showToast("Application submitted", "success");
      router.replace("/compliancedashboard");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message || "Failed to submit application";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay visible={loading} message="Submitting..." />
      <Logo />
      <div>
        <MobileTimeline />
      </div>
      <div className="">
        <h5 className="title">Role Confirmation</h5>
        <p className="small-text">
          Confirm your role and agreement to participate as a Beldium partner.
        </p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item name="agree" initialValue={[]}>
            <Checkbox.Group className="flex flex-col gap-4">
              <Checkbox value="agree">
                I agree to be listed as a compliance partner subject to Beldium’s verification process
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
                  Submit application
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
