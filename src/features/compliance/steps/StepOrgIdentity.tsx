import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Select, DatePicker } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "@/src/features/compliance/component/MobileTimeline";
import Logo from "@/src/features/onboard/component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { complianceOnboarding } from "@/src/features/onboarding/api";
import { Dayjs } from "dayjs";

export function StepOrgIdentity({
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
      const date = values.yearEstablished
        ? (values.yearEstablished as Dayjs).format("YYYY-MM-DD")
        : "";
      const formData = new FormData();
      formData.append("onboarding_step", "organization_identity");
      formData.append("organization_name", String(values.organizationName || ""));
      formData.append("organization_type", String(values.organizationType || ""));
      formData.append("year_of_establishment", date);
      formData.append("country_of_operation", String(values.country || ""));
      formData.append("primary_office_address", String(values.officeAddress || ""));
      await complianceOnboarding(formData);
      showToast("Saved organization identity", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message || "Failed to save organization identity";
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
        <h5 className="title">Organization identity</h5>
        <p className="small-text">Basic details about your registered institution.</p>
      </div>
      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Organization / Firm Name"
            name="organizationName"
            rules={[
              { required: true, message: errorMsg("Organization name is required") },
            ]}
          >
            <Input placeholder="Enter your organization or firm name" />
          </Form.Item>

          <Form.Item
            label="Organization Type"
            name="organizationType"
            rules={[
              { required: true, message: errorMsg("Select organization type") },
            ]}
          >
            <Select placeholder="Select your organization type">
              <Select.Option value="law_firm">Law Firm</Select.Option>
              <Select.Option value="esg_auditor">ESG Auditor</Select.Option>
              <Select.Option value="environmental_consultant">Environmental Consultant</Select.Option>
              <Select.Option value="trade_compliance_specialist">Trade Compliance Specialist</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Year Established"
            name="yearEstablished"
            rules={[
              { required: true, message: errorMsg("Select year of establishment") },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            label="Country of operation"
            name="country"
            rules={[
              { required: true, message: errorMsg("Select country of operation") },
            ]}
          >
            <Select placeholder="Select country">
              <Select.Option value="Nigeria">Nigeria</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Primary Office Address"
            name="officeAddress"
            rules={[
              { required: true, message: errorMsg("Enter your office address") },
            ]}
          >
            <Input placeholder="Enter your office address" />
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
