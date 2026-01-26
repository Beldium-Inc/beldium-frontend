// Step1.tsx
import errorMsg from "@/components/ui/errorMsg";
import { PasswordRules } from "@/components/ui/PasswordRules";
import { Input, Button, Form } from "antd";
import { Rule } from "antd/es/form";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const phoneRules: Rule[] = [
  { required: true, message: errorMsg("Primary phone number is required") },
  {
    pattern: /^[0-9]{10,15}$/,
    message: errorMsg("Phone number must be 10–15 digits"),
  },
];

export function Login() {
  const [form] = Form.useForm();
  const [password, setPassword] = useState("");

  const handleSubmit = (values: any) => {
    console.log("login Data:", values);
  };
  return (
    <div className="w-full md:w-3/4 py-10 px-5 flex flex-col gap-6">
      <div className="w-full">
        <Image
          src="/assets/images/logo.png"
          height={72}
          width={72}
          alt="logo"
        />
      </div>
      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Email Address"
            name="email"
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
            <Input placeholder="company@email.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: errorMsg("Password is required"),
              },
            ]}
            className="mb-6!"
          >
            <Input.Password
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              className="py-3!"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login
              <Image
                src="/assets/icons/arrow-white-icon.svg"
                height={20}
                width={20}
                alt="logo"
              />
            </Button>
          </Form.Item>
        </Form>

        <p className="text-sm">
          You don't have an account?. <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
