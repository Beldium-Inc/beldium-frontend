import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Select } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "@/src/features/compliance/component/MobileTimeline";
import Logo from "@/src/features/onboard/component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { complianceOnboarding } from "@/src/features/onboarding/api";

export function StepExperienceCapacity({
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
      formData.append("onboarding_step", "experience_and_capacity");
      formData.append("years_of_experience", String(values.yearsOfExperience || 0));
      formData.append("primary_focus_areas", String(values.focusArea || ""));
      formData.append("typical_engagement_level", String(values.engagementLevel || ""));
      await complianceOnboarding(formData);
      showToast("Saved experience & capacity", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message || "Failed to save experience & capacity";
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
        <h5 className="title">Experience & Capacity</h5>
        <p className="small-text">Your firm’s experience and typical engagement model.</p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Years of Compliance / Regulatory Experience"
            name="yearsOfExperience"
            rules={[{ required: true, message: errorMsg("Years of experience is required") }]}
          >
            <Input type="number" placeholder="e.g. 15" />
          </Form.Item>
          <Form.Item
            label="Primary Focus Area"
            name="focusArea"
            rules={[{ required: true, message: errorMsg("Primary focus area is required") }]}
          >
            <Select placeholder="Select focus area">
              <Select.Option value="Energy & Natural Resources">Energy & Natural Resources</Select.Option>
              <Select.Option value="Trade & Export Compliance">Trade & Export Compliance</Select.Option>
              <Select.Option value="Environmental & Social Governance">Environmental & Social Governance</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Typical Engagement Level"
            name="engagementLevel"
            rules={[{ required: true, message: errorMsg("Engagement level is required") }]}
          >
            <Select placeholder="Select engagement level">
              <Select.Option value="Advisory">Advisory</Select.Option>
              <Select.Option value="Lead Counsel">Lead Counsel</Select.Option>
              <Select.Option value="Ongoing Compliance Partner">Ongoing Compliance Partner</Select.Option>
            </Select>
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
