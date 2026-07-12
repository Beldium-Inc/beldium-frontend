// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form } from "antd";
import { ArrowLeftIcon } from "./ui/ArrowIcon";
import { Rule } from "antd/es/form";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signup } from "./api";
import { showToast } from "@/src/store/toast.store";
import { useOnboardingStore } from "./onboarding.store";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { SocialButton } from "./ui/SocialButton";

const phoneRules: Rule[] = [
  { required: true, message: errorMsg("Primary phone number is required") },
  {
    pattern: /^[0-9]{10,15}$/,
    message: errorMsg("Phone number must be 10–15 digits"),
  },
];

type OnboardFormValues = {
  companyName: string;
  phone: string;
  email: string;
  password: string;
};

type OnboardingData = {
  name: string;
  email: string;
  preferences: string[];
  role?: "miner" | "partner";
};

export function Onboard({
  data,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  onNext: () => void;
  onBack?: () => void;
}) {
  const [form] = Form.useForm();
  const { setData } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: OnboardFormValues) => {
    try {
      setLoading(true);
      const roleValue =
        (data?.role === "miner" && "Miner") ||
        (data?.role === "partner" && "Compliance") ||
        "Miner";

      const payload = {
        email: values.email,
        password: values.password,
        company_name: values.companyName,
        phone_number: values.phone,
        device_token: "string",
        device_type: "web" as const,
        role: roleValue as "Miner" | "Compliance",
      };

      console.log("Signup Payload:", payload);

      await signup(payload);
      setData({ email: values.email });
      if (typeof window !== "undefined") {
        localStorage.setItem("hasRegistered", "true");
      }
      showToast("Sign up successful. Check your email for the 6-digit code.", "success");
      onNext();
    } catch (error: unknown) {
      let msg = "Sign up failed. Please try again.";
      if (typeof error === "object" && error && "response" in error) {
        const e = error as { response?: { data?: { message?: string } } };
        msg = e.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message || msg;
      }
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex mt-10 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center h-8 w-8 text-gray-700"
          aria-label="Back"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="text-xl pt-2 font-semibold text-gray-900">Create your account</h2>
      </div>

      <div className="flex flex-col gap-3">
        <SocialButton provider="google" />
        <SocialButton provider="facebook" />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        Or continue with email
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Company Name"
            name="companyName"
            rules={[
              { required: true, message: errorMsg("Company name is required") },
              {
                min: 2,
                message: errorMsg("Company name must be at least 2 characters"),
              },
            ]}
          >
            <Input placeholder="Acme Corporation" />
          </Form.Item>

          <Form.Item label="Primary Phone" name="phone" rules={phoneRules}>
            <Input
              placeholder="08012345678"
              inputMode="numeric"
              maxLength={15}
            />
          </Form.Item>

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
                message: (
                  <span className="text-red-500 text-xs">
                    Password is required
                  </span>
                ),
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  if (value.length < 8)
                    return Promise.reject(errorMsg("Minimum 8 characters"));
                  if (!/[A-Z]/.test(value))
                    return Promise.reject(
                      errorMsg("At least one uppercase letter"),
                    );
                  if (!/[a-z]/.test(value))
                    return Promise.reject(
                      errorMsg("At least one lowercase letter"),
                    );
                  if (!/[0-9]/.test(value))
                    return Promise.reject(errorMsg("At least one number"));
                  if (!/[^A-Za-z0-9]/.test(value))
                    return Promise.reject(
                      errorMsg("At least one special character"),
                    );

                  return Promise.resolve();
                },
              },
            ]}
            className="mb-3!"
          >
            <Input.Password
              placeholder="Enter password"
              className="py-3!"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Create Account
              <Image
                src="/assets/icons/arrow-white-icon.svg"
                height={20}
                width={20}
                alt="logo"
              />
            </Button>
          </Form.Item>
        </Form>
        <LoadingOverlay visible={loading} message="Creating your account..." />
        <p className="text-sm">
          Already have an account?. <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
