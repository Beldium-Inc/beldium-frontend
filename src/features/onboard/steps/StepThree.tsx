// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Select, DatePicker, Upload } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StepHeader } from "../component/StepHeader";
import { UploadedFilePreview } from "../component/UploadedFilePreview";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";
import { Dayjs } from "dayjs";

export function StepThree({
  data,
  onNext,
}: {
  data: unknown;
  onNext: () => void;
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  const saveStep = async (values: Record<string, unknown>) => {
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
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      await saveStep(values);
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

  const handleSaveAndExit = async () => {
    try {
      const values = await form.validateFields();
      setExiting(true);
      await saveStep(values);
      showToast("Progress saved. You can resume anytime.", "success");
      router.push("/dashboard");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } }; errorFields?: unknown };
      if (e?.errorFields) return;
      const msg = e?.response?.data?.message || "Failed to save progress";
      showToast(msg, "error");
    } finally {
      setExiting(false);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay visible={loading} message="Saving..." />
      <StepHeader title="Licensing & Regulatory Status" subtitle="Tell us about your license status" />

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Mining title status"
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
                  In process / Pending
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Issuing authority"
            name="issuingAuthority"
            rules={[
              {
                required: true,
                message: errorMsg("Select Issuing Authority"),
              },
            ]}
          >
            <Select placeholder="Select your issuing authority">
              <Select.Option value="State">State</Select.Option>
              <Select.Option value="Federal">Federal</Select.Option>
              <Select.Option value="Local">Local Government</Select.Option>
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
            <DatePicker className="w-full" placeholder="Select date" />
          </Form.Item>

          <Form.Item label="License certificate">
            <Upload.Dragger
              beforeUpload={(file) => {
                setLicenseDoc(file);
                return false;
              }}
              onRemove={() => setLicenseDoc(null)}
              showUploadList={false}
              multiple={false}
              accept=".pdf,.png,.jpg,.jpeg"
            >
              <p className="text-sm">Choose file or drag and drop it here</p>
              <p className="text-xs text-gray-400">JPEG, PNG, and PDF formats, up to 20 MB.</p>
            </Upload.Dragger>
            {licenseDoc && (
              <UploadedFilePreview
                fileName={licenseDoc.name}
                fileSizeKb={Math.round(licenseDoc.size / 1024)}
                onRemove={() => setLicenseDoc(null)}
              />
            )}
          </Form.Item>

          <div className="flex items-center gap-8 mt-6">
            <Form.Item className="mb-0 flex-1">
              <Button type="primary" htmlType="submit" block size="large">
                Save and continue
                <Image
                  src="/assets/icons/arrow-white-icon.svg"
                  height={20}
                  width={20}
                  alt=""
                />
              </Button>
            </Form.Item>
            <button
              type="button"
              onClick={handleSaveAndExit}
              disabled={exiting}
              className="text-sm whitespace-nowrap text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
            >
              {exiting ? "Saving..." : "Save and exit"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
