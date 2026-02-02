// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio } from "antd";
import Image from "next/image";
import Link from "next/link";
import MobileTimeline from "../component/MobileTimeline";
import Logo from "../component/Logo";

export function StepFive({
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
          
        </Button>
      </div>
      <div className="">
        <h5 className="title">Production & Supply Signals</h5>
        <p className="small-text">
          Provide operational details to guide buyer and logistics matching
        </p>
      </div>

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off">
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
                <Radio value="EIA completed">EIA completed</Radio>
                <Radio value="EIA in progress">EIA in progress</Radio>
                <Radio value="Not yet initiated">Not yet initiated</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Environmental Consultant (if any) "
            name="environmentalConsultant"
          >
            <Input placeholder="Environmental Consultant " />
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
