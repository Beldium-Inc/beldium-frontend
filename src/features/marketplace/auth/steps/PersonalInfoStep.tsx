"use client";

import { Form, Input, Select, Button } from "antd";
import Link from "next/link";
import StepHeader from "./StepHeader";
import { NIGERIA_STATES } from "@/src/features/onboard/component/nigeriaStates";
import type { MarketplaceRegisterPersonalInfo } from "@/src/features/marketplace/auth/marketplace-auth-api";

export default function PersonalInfoStep({
  value,
  onContinue,
}: {
  value: MarketplaceRegisterPersonalInfo | null;
  onContinue: (info: MarketplaceRegisterPersonalInfo) => void;
}) {
  const [form] = Form.useForm<MarketplaceRegisterPersonalInfo>();

  return (
    <div>
      <StepHeader
        step={1}
        totalSteps={2}
        title="Personal information"
        subtitle="Tell us a little about yourself to set up your Beldium account."
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={value ?? undefined}
        onFinish={onContinue}
      >
        <Form.Item
          label="Full name"
          name="full_name"
          rules={[{ required: true, message: "Full name is required" }]}
        >
          <Input placeholder="Enter name" size="large" />
        </Form.Item>

        <Form.Item
          label="State"
          name="state"
          rules={[{ required: true, message: "State is required" }]}
        >
          <Select
            placeholder="Select state"
            size="large"
            options={NIGERIA_STATES.map((s) => ({ label: s, value: s }))}
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Business address"
          name="business_address"
          rules={[{ required: true, message: "Business address is required" }]}
        >
          <Input placeholder="Enter address" size="large" />
        </Form.Item>

        <Form.Item
          label="Company name"
          name="company_name"
          rules={[{ required: true, message: "Company name is required" }]}
        >
          <Input placeholder="Enter company name" size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" className="!bg-[#101E3D]">
          Continue
        </Button>
      </Form>

      <p className="text-center text-sm text-gray-500 !mt-4">
        Already have an account?{" "}
        <Link href="/marketplace/login" className="text-[#101E3D] font-medium underline">
          Login
        </Link>
      </p>
    </div>
  );
}
