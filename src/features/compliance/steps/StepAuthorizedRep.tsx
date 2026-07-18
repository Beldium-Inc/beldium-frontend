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

export function StepAuthorizedRep({
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
      formData.append("onboarding_step", "authorized_representative");
      formData.append("full_name", String(values.fullName || ""));
      formData.append("role", String(values.role || ""));
      formData.append("email", String(values.email || ""));
      formData.append("phone_number", String(values.phone || ""));
      await complianceOnboarding(formData);
      showToast("Saved authorized representative", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message || "Failed to save authorized representative";
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
        <h5 className="title">Authorized Representative</h5>
        <p className="small-text">Details of the person authorized to engage.</p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: errorMsg("Full name is required") }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            label="Role / Title"
            name="role"
            rules={[{ required: true, message: errorMsg("Role is required") }]}
          >
            <Input placeholder="Enter role/title" />
          </Form.Item>
          <Form.Item
            label="Official Email"
            name="email"
            rules={[
              { required: true, message: errorMsg("Email is required") },
              { type: "email", message: errorMsg("Enter a valid email address") },
            ]}
          >
            <Input placeholder="company@email.com" />
          </Form.Item>
          <Form.Item
            label="Phone / WhatsApp"
            name="phone"
            rules={[
              { required: true, message: errorMsg("Phone number is required") },
              { pattern: /^[0-9+ \-]{10,20}$/, message: errorMsg("Enter a valid phone number") },
            ]}
          >
            <Input placeholder="0912 008 2000" />
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
