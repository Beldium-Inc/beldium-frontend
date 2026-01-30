// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Select } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "../component/MobileTimeline";
import Logo from "../component/Logo";

export function StepOne({ data, onNext }: { data: any; onNext: any }) {
  const [form] = Form.useForm();
  const handleSubmit = (values: any) => {
    console.log("Registration Data:", values);
    onNext();
  };
  return (
    <div className="flex flex-col gap-6">
      <Logo/>
      <MobileTimeline />

      <div className="">
        <h5 className="title">Mining Identity</h5>
        <p className="small-text">Tell us who is registering this operation</p>
      </div>

      <div className="flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off">
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
                type: "number",
                message: errorMsg("Please enter a valid phone number"),
              },
            ]}
          >
            <Input placeholder="0911 323 1998" />
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
            <Select placeholder="Nigeria">
              <Select.Option value="ng">Nigeria</Select.Option>
              <Select.Option value="us">Ghana </Select.Option>
            </Select>
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
            <Select placeholder="Select your local government area">
              <Select.Option value="Ido">Ido</Select.Option>
              <Select.Option value="Lafia">Lafia </Select.Option>
            </Select>
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
