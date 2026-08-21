"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, Button, Divider } from "antd";
import MarketplaceAuthShell from "./MarketplaceAuthShell";
import { getGoogleOAuthUrl, loginMarketplaceUser } from "@/src/features/marketplace/auth/marketplace-auth-api";
import { showToast } from "@/src/store/toast.store";

type LoginValues = { email: string; password: string };

export default function MarketplaceLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/marketplace";
  const [form] = Form.useForm<LoginValues>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginValues) => {
    try {
      setLoading(true);
      const res = await loginMarketplaceUser(values.email, values.password);
      const access = res?.data?.access;
      if (access) {
        sessionStorage.setItem("accessToken", access);
        sessionStorage.setItem("tokenExpiration", String(Date.now() + 3600 * 1000));
      }
      if (res?.data?.refresh) {
        sessionStorage.setItem("refreshToken", res.data.refresh);
      }
      showToast("Login successful", "success");
      router.push(redirectTo);
    } catch (error: unknown) {
      let msg = "Login failed. Please check your credentials.";
      if (typeof error === "object" && error && "response" in error) {
        const e = error as { response?: { data?: { message?: string } } };
        msg = e.response?.data?.message || msg;
      }
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketplaceAuthShell showBackLink>
      <div className="flex flex-col items-center text-center gap-1 mb-6">
        <Image src="/assets/images/logo.png" alt="Beldium" width={32} height={32} />
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mt-2">Welcome to Beldium</h2>
        <p className="text-sm text-gray-500">Use your email to log in or create an account</p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="E-mail"
          name="email"
          rules={[
            { required: true, message: "E-mail is required" },
            { type: "email", message: "Enter a valid e-mail" },
          ]}
        >
          <Input placeholder="Enter your e-mail" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password placeholder="Enter your password" size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" loading={loading} className="!bg-[#101E3D]">
          Continue
        </Button>
      </Form>

      <p className="text-center text-sm text-gray-500 !mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/marketplace/register" className="text-[#101E3D] font-medium underline">
          Create account
        </Link>
      </p>

      {/* <Divider plain className="text-gray-400 text-xs">
        OR
      </Divider>

      <a href={getGoogleOAuthUrl()}>
        <Button block size="large" icon={<GoogleIcon />}>
          Continue with google
        </Button>
      </a> */}
    </MarketplaceAuthShell>
  );
}

function GoogleIcon() {
  return (
    <Image src="/assets/icons/google-icon.svg" alt="" width={18} height={18} className="inline -mt-0.5" />
  );
}
