// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio} from "antd";
import Image from "next/image";
import Link from "next/link";

export function StepFour({
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
        <h5 className="title">Environmental & ESG Readiness</h5>
        <p className="small-text">
          Let us know your current environmental and safety practices.
        </p>
      </div>

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Estimated Monthly Output Range"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg(
                  "Please select your estimated monthly output range",
                ),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="">&lt; 50 tons</Radio>
                <Radio value="">50–200 tons</Radio>
                <Radio value="">&gt; 200 tons</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Logistics access"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg("Please select your logistics access"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="">Road</Radio>
                <Radio value="">Rail</Radio>
                <Radio value="">Port access planned </Radio>
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
