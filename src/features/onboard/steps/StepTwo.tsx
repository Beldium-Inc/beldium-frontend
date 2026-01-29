// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form, Radio, Select} from "antd";
import Image from "next/image";
import Link from "next/link";

export function StepTwo({
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
        /> Back
      </Button>
      <div className="">
        <h5 className="title">Mining Operation Profile</h5>
        <p className="small-text">Tell us what you do</p>
      </div>

      <div className="w-full flex flex-col gap-6">
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Mineral type"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg("Mineral type required"),
              },
            ]}
          >
            <Input placeholder="Lithium" />
          </Form.Item>

          <Form.Item
            label="Mining method"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg("Please select your mining method"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="">Open pit</Radio>
                <Radio value="">Shaft of Underground</Radio>
                <Radio value="">Exploartion</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Depth range"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg("Select your depth range"),
              },
            ]}
          >
            <Select placeholder="100m - 200m">
              <Select.Option value="ng">100m - 200m</Select.Option>
              <Select.Option value="us">200m - 300m </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Operation status"
            name=""
            rules={[
              {
                required: true,
                message: errorMsg("Please select your mining method"),
              },
            ]}
          >
            <Radio.Group>
              <div className="w-full flex flex-col gap-3">
                <Radio value="">Active</Radio>
                <Radio value="">Developing</Radio>
                <Radio value="">Temporarily inactive</Radio>
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
