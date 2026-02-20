// Step3.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  DatePicker,
} from "antd";

import Image from "next/image";
import Link from "next/link";

const steps = [
  { id: 1, title: "Miner Identity", status: "completed" },
  { id: 2, title: "Mining Operation Profile", status: "completed" },
  { id: 3, title: "Licensing & Regulatory Status", status: "active" },
  { id: 4, title: "Environmental & ESG Readiness", status: "pending" },
  { id: 5, title: "Production & Supply Signals", status: "pending" },
  { id: 6, title: "Compliance Support Opt-In", status: "pending" },
  { id: 7, title: "Declaration & Authority", status: "pending" },
];

export function ProfileOnboard({
  data,
  onNext,
  onBack,
}: {
  data: unknown;
  onNext: () => void;
  onBack: () => void;
}) {
  const [form] = Form.useForm();
  return (
    <div className=" relative w-full h-screen flex justify-between items-center">
      {/* left panel */}
      <div className="hidden lg:block text-primary w-1/2 h-screen bg-gradient-to-tl from-slate-400 from-0% via-sky-50 via-50% to-slate-50 to-100% rounded-2xl">
        <div className="flex flex-col items-center justify-center h-full w-full  p-25">
          <div className="rounded-xl w-full shawdow1 transparent p-2  shadow-sm ">
            <div className="w-full  flex flex-col gap-6 p-6 bg-white rounded-2xl">
              {/* Title */}
              <h2 className="mb-6  text-sm font-semibold">
                Complete Your Profile
              </h2>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-0 h-full w-px bg-gray-200" />

                <div className="space-y-6">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-4">
                      {/* Indicator */}
                      <div className="relative z-10">
                        {step.status === "completed" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f172a] text-white">
                            ✓
                          </div>
                        )}

                        {step.status === "active" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0f172a]">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#0f172a]" />
                          </div>
                        )}

                        {step.status === "pending" && (
                          <div className="h-6 w-6 rounded-full border border-gray-300 bg-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <p className="text-[11px] text-gray-400">
                          Step {step.id}
                        </p>
                        <p className="text-sm text-gray-900">{step.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* right panel  */}
      <div className="w-full lg:w-1/2 lg:p-10 h-screen flex justify-center items-center overflow-y-scroll">
        <div className="w-full md:w-3/4 py-10 px-5 flex flex-col gap-6">
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

              <Form.Item
                label="License Number (if available)"
                name="licenseNumber"
              >
                <Input placeholder="license number" />
              </Form.Item>

              <Form.Item
                label="License Issue Date"
                name="date"
                rules={[
                  {
                    required: true,
                    message: errorMsg("Select Issuing Authority"),
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Select date"
                />
              </Form.Item>

              <div className="flex items-center gap-10">
                <Form.Item>
                  <Button type="primary" htmlType="submit" block size="large">
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
      </div>
      
    </div>
  );
}
