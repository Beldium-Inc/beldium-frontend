// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio } from "antd";
import Image from "next/image";
import Link from "next/link";

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
    <div className="w-full md:w-3/4 py-10 px-5 flex flex-col gap-6">
      <Button type="text" onClick={onBack}>
        <Image
          src="/assets/icons/arrow-icon.svg"
          height={24}
          width={24}
          alt="logo"
        />{" "}
        Back
      </Button>
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
            name=""
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
                <Radio value="">EIA completed</Radio>
                <Radio value="">EIA in progress</Radio>
                <Radio value="">Not yet initiated</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Environmental Consultant (if any) " name="">
            <Input placeholder="Environmental Consultant " />
          </Form.Item>

          <Form.Item
            label="Safety Measures in Place?"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg("Please select safe major in place"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="">Yes</Radio>
                <Radio value="">No</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Community Engagement Conducted?"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg("Please select safe major in place"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="">Yes</Radio>
                <Radio value="">No</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <div className="flex items-center gap-10">
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

            <p className="text-sm">
              <Link href="/">Save and Exit</Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
