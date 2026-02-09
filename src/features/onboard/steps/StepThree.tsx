// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Select, DatePicker, Upload } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "../component/MobileTimeline";
import Logo from "../component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";
import dayjs, { Dayjs } from "dayjs";

export function StepThree({
  data,
  onNext,
}: {
  data: unknown;
  onNext: () => void;
}) {
  const [form] = Form.useForm();
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const titleLabel = String(values.miningTitleStatus || "");
      const title =
        titleLabel === "Valid Mining Lease (ML)"
          ? "valid_mining_license"
          : titleLabel === "Small Scale Mining Lease (SSML)"
          ? "small_scale_mining_lease"
          : titleLabel === "Exploration License (EL)"
          ? "exploration_license"
          : titleLabel === "In progress / Pending"
          ? "inprocess_or_pending"
          : "";
      const date = values.licenseIssueDate
        ? (values.licenseIssueDate as Dayjs).format("YYYY-MM-DD")
        : "";
      const formData = new FormData();
      formData.append("onboarding_step", "licensing_regulatory_status");
      formData.append("mining_title_status", title);
      formData.append("issuing_authority", String(values.issuingAuthority || ""));
      formData.append("license_number", String(values.licenseNumber || ""));
      formData.append("license_issue_date", date);
      if (licenseDoc) {
        formData.append("license_certificate", licenseDoc);
      } else {
        formData.append("license_certificate", "");
      }
      await minerOnboarding(formData);
      showToast("Saved licensing & regulatory status", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message ||
        "Failed to save licensing & regulatory status";
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
        <h5 className="title">Licensing & Regulatory Status</h5>
        <p className="small-text">Tell us about your license status</p>
      </div>

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Mining Title Status"
            name="miningTitleStatus"
            rules={[
              {
                required: true,
                message: errorMsg("Please select mining title status"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Valid Mining Lease (ML)">
                  Valid Mining Lease (ML)
                </Radio>
                <Radio value="Small Scale Mining Lease (SSML)">
                  Small Scale Mining Lease (SSML)
                </Radio>
                <Radio value="Exploration License (EL)">
                  Exploration License (EL)
                </Radio>
                <Radio value="In progress / Pending">
                  In progress / Pending
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Issuing Authority"
            name="issuingAuthority"
            rules={[
              {
                required: true,
                message: errorMsg("Select Issuing Authority"),
              },
            ]}
          >
            <Select placeholder="Issuing Authority">
              <Select.Option value="State">State</Select.Option>
              <Select.Option value="Federal">Federal</Select.Option>
              <Select.Option value="Local">Local</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="License number (if available)"
            name="licenseNumber"
          >
            <Input placeholder="Enter your license number" />
          </Form.Item>

          <Form.Item
            label="License issue date"
            name="licenseIssueDate"
            rules={[
              {
                required: true,
                message: errorMsg("Select license issue date"),
              },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item label="License certificate">
            <Upload.Dragger
              beforeUpload={(file) => {
                setLicenseDoc(file);
                return false;
              }}
              onRemove={() => setLicenseDoc(null)}
              onChange={({ fileList }) => {
                const f = fileList?.[0]?.originFileObj as File | undefined;
                setLicenseDoc(f || null);
              }}
              multiple={false}
              accept=".pdf,.png,.jpg,.jpeg"
            >
              <p className="text-sm">Choose file or drag and drop it here</p>
              <p className="text-xs">JPEG, PNG, and PDF formats, up to 20 MB.</p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            label="Issuing Authority"
            name="issuingAuthority"
            rules={[
              {
                required: true,
                message: errorMsg("Select Issuing Authority"),
              },
            ]}
          >
            <Select placeholder="Issuing Authority">
              <Select.Option value="ng">State</Select.Option>
              <Select.Option value="us">Local Government </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="License Number (if available)" name="licenseNumber">
            <Input placeholder="license number" />
          </Form.Item>

          <Form.Item
            label="License Issue Date"
            name="licenseIssueDate"
            rules={[
              {
                required: true,
                message: errorMsg("Select Issuing Authority"),
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} placeholder="Select date" />
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
