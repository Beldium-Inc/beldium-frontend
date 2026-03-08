// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Upload } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "../component/MobileTimeline";
import Logo from "../component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";

const ESG_DOCUMENTATION_STATUS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
  NOT_YET_INITIATED: "not_yet_initiated",
} as const;

export function StepFour({
  data,
  onNext,
}: {
  data: unknown;
  onNext: () => void;
}) {
  const [form] = Form.useForm();
  const [envDoc, setEnvDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("onboarding_step", "environmental_esg");
      formData.append(
        "environmental_documentation",
        String(values.environmentalDocumentation || "")
      );
      formData.append(
        "environmental_consultant",
        String(values.environmentalConsultant || "")
      );
      const smip = String(values.SMIP || "");
      const cec = String(values.CEC || "");
      formData.append("has_safety_measures", smip === "Yes" ? "true" : "false");
      formData.append(
        "has_conducted_community_engagement",
        cec === "Yes" ? "true" : "false"
      );
      if (envDoc) {
        formData.append("environmental_compliance_document", envDoc);
      } else {
        formData.append("environmental_compliance_document", "");
      }
      await minerOnboarding(formData);
      showToast("Saved environmental & ESG readiness", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message ||
        "Failed to save environmental & ESG readiness";
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
        <h5 className="title">Environmental & ESG Readiness</h5>
        <p className="small-text">
          Let us know your current environmental and safety practices.
        </p>
      </div>

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Environmental Documentation"
            name="environmentalDocumentation"
            rules={[
              {
                required: true,
                message: errorMsg(
                  "Please select your environmental documentation",
                ),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value={ESG_DOCUMENTATION_STATUS.COMPLETED}>
                  EIA completed
                </Radio>
                <Radio value={ESG_DOCUMENTATION_STATUS.IN_PROGRESS}>
                  EIA in progress
                </Radio>
                <Radio value={ESG_DOCUMENTATION_STATUS.NOT_YET_INITIATED}>
                  Not yet initiated
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Environmental & Compliance Documents"
            dependencies={["environmentalDocumentation"]}
            rules={[
              ({ getFieldValue }) => ({
                validator: async () => {
                  const status = String(
                    getFieldValue("environmentalDocumentation") || ""
                  );
                  const requiresDocument =
                    status === ESG_DOCUMENTATION_STATUS.COMPLETED ||
                    status === ESG_DOCUMENTATION_STATUS.IN_PROGRESS;
                  if (!requiresDocument || envDoc) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Please upload your environmental compliance document"
                    )
                  );
                },
              }),
            ]}
          >
            <Upload.Dragger
              beforeUpload={(file) => {
                setEnvDoc(file);
                return false;
              }}
              onRemove={() => setEnvDoc(null)}
              onChange={({ fileList }) => {
                const f = fileList?.[0]?.originFileObj as File | undefined;
                setEnvDoc(f || null);
              }}
              multiple={false}
              accept=".pdf,.png,.jpg,.jpeg"
            >
              <p className="text-sm">Choose file or drag and drop it here</p>
              <p className="text-xs">JPEG, PNG, and PDF formats, up to 20 MB.</p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            label="Environmental Consultant (if any)"
            name="environmentalConsultant"
          >
            <Input placeholder="Environmental Consultant" />
          </Form.Item>

          <Form.Item
            label="Safety Measures in Place?"
            name="SMIP"
            rules={[
              {
                required: true,
                message: errorMsg("Please select safe major in place"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Community Engagement Conducted?"
            name="CEC"
            rules={[
              {
                required: true,
                message: errorMsg("Please select safe major in place"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </div>
            </Radio.Group>
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
