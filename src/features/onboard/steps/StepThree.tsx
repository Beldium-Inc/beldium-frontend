// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Select, DatePicker } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "../component/MobileTimeline";
import Logo from "../component/Logo";

export function StepThree({
  data,
  onNext,
  onBack,
}: {
  data: any;
  onNext: any;
  onBack: any;
}) {
  const [form] = Form.useForm();
  const handleSubmit = (values: any) => {
    console.log("Registration Data:", values);
    onNext();
  };
  return (
    <div className="flex flex-col gap-6">
      <Logo />
      <div>
        <MobileTimeline />

        <Button type="text" onClick={onBack}>
          <Image
            src="/assets/icons/arrow-icon.svg"
            height={24}
            width={24}
            alt="logo"
          />
          Back
        </Button>
      </div>
      <div className="">
        <h5 className="title">Mining Operation Profile</h5>
        <p className="small-text">Tell us what you do </p>
      </div>

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off">
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
                  onClick={handleSubmit}
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
