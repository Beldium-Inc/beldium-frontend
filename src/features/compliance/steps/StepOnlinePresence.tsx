import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "@/src/features/compliance/component/MobileTimeline";
import Logo from "@/src/features/onboard/component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { complianceOnboarding } from "@/src/features/onboarding/api";

export function StepOnlinePresence({
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
      formData.append("onboarding_step", "online_presence");
      formData.append("website_url", String(values.websiteUrl || ""));
      formData.append("linkedin_url", String(values.linkedinUrl || ""));
      await complianceOnboarding(formData);
      showToast("Saved online presence", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message || "Failed to save online presence";
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
        <h5 className="title">Online Presence</h5>
        <p className="small-text">Official websites or digital profiles.</p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Official Website URL"
            name="websiteUrl"
            rules={[{ required: true, message: errorMsg("Website URL is required") }]}
          >
            <Input placeholder="https://www.example.com" />
          </Form.Item>
          <Form.Item
            label="LinkedIn Page URL"
            name="linkedinUrl"
            rules={[{ required: true, message: errorMsg("LinkedIn URL is required") }]}
          >
            <Input placeholder="https://www.linkedin.com/company/example" />
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
                <Link href="/compliancedashboard" className="underline! text-gray-600! hover:text-gray-900!">Save Progress</Link>
              </p>
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
