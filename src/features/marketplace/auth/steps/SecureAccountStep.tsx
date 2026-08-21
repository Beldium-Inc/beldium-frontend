"use client";

import { Form, Input, Button } from "antd";
import StepHeader from "./StepHeader";

export type SecureAccountValues = { email: string; password: string; confirm_password: string };

export default function SecureAccountStep({
  submitting,
  onSubmit,
  onBack,
}: {
  submitting: boolean;
  onSubmit: (values: SecureAccountValues) => void;
  onBack: () => void;
}) {
  const [form] = Form.useForm<SecureAccountValues>();

  return (
    <div>
      <StepHeader
        step={2}
        totalSteps={2}
        title="Secure your account"
        subtitle="Enter your email and create a password to secure your Beldium account."
      />

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="E-mail address"
          name="email"
          rules={[
            { required: true, message: "E-mail address is required" },
            { type: "email", message: "Enter a valid e-mail address" },
          ]}
        >
          <Input placeholder="Enter e-mail address" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="Enter password" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="confirm_password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm password" size="large" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={submitting}
          className="!bg-[#101E3D]"
        >
          Create account
        </Button>
        <Button block size="large" className="!mt-2" onClick={onBack} disabled={submitting}>
          Back
        </Button>
      </Form>
    </div>
  );
}
