// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Select, Upload } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "../component/MobileTimeline";
import Logo from "../component/Logo";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { showToast } from "@/src/store/toast.store";
import { minerOnboarding } from "@/src/features/onboarding/api";

export function StepOne({ data, onNext }: { data: unknown; onNext: () => void }) {
  const [form] = Form.useForm();
  const [govDoc, setGovDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("onboarding_step", "miner_identity");
      formData.append("country", String(values.countryOperation || ""));
      formData.append("state_of_operation", String(values.stateOperation || ""));
      formData.append("local_government_area", String(values.lga || ""));
      formData.append("business_role", String(values.businessRole || ""));
      formData.append(
        "government_issue_document_type",
        String(values.govDocType || "")
      );
      if (govDoc) {
        formData.append("government_issue_document", govDoc);
      } else {
        formData.append("government_issue_document", "");
      }
      await minerOnboarding(formData);
      showToast("Saved miner identity", "success");
      onNext();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      const msg =
        e?.response?.data?.message || "Failed to save miner identity";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <LoadingOverlay visible={loading} message="Saving..." />
      <Logo/>
      <MobileTimeline />

      <div className="">
        <h5 className="title">Mining Identity</h5>
        <p className="small-text">Tell us who is registering this operation</p>
      </div>

      <div className="flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="Full name / Company name"
            name="name"
            rules={[
              {
                required: true,
                message: errorMsg("Full name / Company name"),
              },
              {
                message: errorMsg("Please enter a valid email address"),
              },
            ]}
          >
            <Input placeholder="Oke Ayo Mineral Ltd" />
          </Form.Item>

          <Form.Item
            label="Business Role"
            name="businessRole"
            rules={[
              {
                required: true,
                message: errorMsg("Please select business role"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="Mining Company">Mining Company</Radio>
                <Radio value="Licensed Miner">Licensed Miner</Radio>
                <Radio value="Leased Holder">Leased Holder</Radio>
                <Radio value="Operator / Contractor">
                  Operator / Contractor
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Phone number (Whatsapp enable)"
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: errorMsg("Phone number required"),
              },
              {
                pattern: /^\d{10,15}$/,
                message: errorMsg("Phone number must be 10–15 digits"),
              },
            ]}
          >
            <Input placeholder="08012345678" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="emailAddress"
            rules={[
              {
                required: true,
                message: errorMsg("Email address is required"),
              },
              {
                type: "email",
                message: errorMsg("Please enter a valid email address"),
              },
            ]}
          >
            <Input placeholder="okeayominerals@gmail.com" />
          </Form.Item>

          <Form.Item
            label="Country of Operation"
            name="countryOperation"
            rules={[
              {
                required: true,
                message: errorMsg("Select country of operation"),
              },
            ]}
          >
            <Input placeholder="Nigeria" />
          </Form.Item>

          <Form.Item
            label="State of operation"
            name="stateOperation"
            rules={[
              {
                required: true,
                message: errorMsg("Select your state of operation"),
              },
            ]}
          >
            <Input placeholder="Select your state of operation" />
          </Form.Item>

          <Form.Item
            label="Local Government Area"
            name="lga"
            rules={[
              {
                required: true,
                message: errorMsg("Select your local government area"),
              },
            ]}
          >
            <Input placeholder="Select your local government area" />
          </Form.Item>

          <Form.Item
            label="Government-issued ID type"
            name="govDocType"
            rules={[
              {
                required: true,
                message: errorMsg("Select an ID type"),
              },
            ]}
          >
            <Select placeholder="Select document type">
              <Select.Option value="passport">Passport</Select.Option>
              <Select.Option value="national_id">National ID</Select.Option>
              <Select.Option value="driver_license">Driver’s License</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Government-issued ID">
            <Upload.Dragger
              beforeUpload={(file) => {
                setGovDoc(file);
                return false;
              }}
              onRemove={() => setGovDoc(null)}
              onChange={({ fileList }) => {
                const f = fileList?.[0]?.originFileObj as File | undefined;
                setGovDoc(f || null);
              }}
              multiple={false}
              accept=".pdf,.png,.jpg,.jpeg"
            >
              <p className="text-sm">Choose file or drag and drop it here</p>
              <p className="text-xs">JPEG, PNG, and PDF formats, up to 20 MB.</p>
            </Upload.Dragger>
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
