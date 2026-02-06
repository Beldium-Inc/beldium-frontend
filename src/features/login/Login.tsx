// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { login, getUser } from "@/src/features/onboarding/api";
import { showToast } from "@/src/store/toast.store";

type LoginFormValues = {
  email: string;
  password: string;
};

export function Login() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const res = await login({ email: values.email, password: values.password });
      const access = res?.data?.access;
      const refresh = res?.data?.refresh;
      if (access) localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
      showToast("Login successful", "success");
      try {
        const userRes = await getUser();
        const completed = userRes?.data?.has_completed_onboarding;
        if (completed) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } catch {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      let msg = "Login failed. Please check your credentials.";
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
              className="py-3!"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
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
        <LoadingOverlay visible={loading} message="Logging you in..." />

        <p className="text-sm">
          You don&apos;t have an account?. <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
