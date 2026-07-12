// Step1.tsx
import errorMsg from "@/src/components/ui/errorMsg";
import { Input, Button, Form } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/src/components/ui/LoadingOverlay";
import { login, getUser } from "@/src/features/onboarding/api";
import { showToast } from "@/src/store/toast.store";
import { SocialButton } from "@/src/features/onboarding/ui/SocialButton";

type LoginFormValues = {
  email: string;
  password: string;
};

import { useOnboardingStore } from "@/src/features/onboarding/onboarding.store";

// ... existing imports ...

export function Login() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    sessionStorage.setItem("allowRegistration", "true");
    useOnboardingStore.getState().setStep(1);
    router.push("/register");
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const payload = { email: values.email, password: values.password };
      const res = await login(payload);
      const access = res?.data?.access;
      const refresh = res?.data?.refresh;
      if (access) {
        sessionStorage.setItem("accessToken", access);
        const expiresAt = Date.now() + 3600 * 1000; // 1 hour expiration
        sessionStorage.setItem("tokenExpiration", String(expiresAt));
        localStorage.removeItem("accessToken"); // Clean up local storage
      }
      if (refresh) {
        sessionStorage.setItem("refreshToken", refresh);
        localStorage.removeItem("refreshToken"); // Clean up local storage
      }
      showToast("Login successful", "success");
      
      // Ensure token is set before calling getUser
      if (!access && !sessionStorage.getItem("accessToken")) {
         throw new Error("Authentication failed: No access token received");
      }

      try {
        const userRes = await getUser();
        const completed = userRes?.data?.has_completed_onboarding;
        const role = userRes?.data?.role; // "Miner" | "Compliance"

        if (completed) {
          if (role === "Compliance") {
            router.push("/compliancedashboard?persona=compliance");
          } else {
            router.push("/dashboard");
          }
        } else {
          if (role === "Compliance") {
            router.push("/complianceonboarding");
          } else {
            router.push("/onboarding");
          }
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
    <div className="w-full flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500">Log in to continue to your Beldium account.</p>
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
          You don&apos;t have an account?.{" "}
          <a href="/register" onClick={handleRegisterClick} className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
