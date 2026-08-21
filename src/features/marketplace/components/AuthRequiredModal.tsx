"use client";

import { Modal, Button } from "antd";
import { useRouter } from "next/navigation";
import { LockOutlined } from "@ant-design/icons";

export default function AuthRequiredModal({
  open,
  onClose,
  redirectTo,
}: {
  open: boolean;
  onClose: () => void;
  redirectTo: string;
}) {
  const router = useRouter();

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={380}>
      <div className="flex flex-col items-center text-center gap-1 pt-2">
        <div className="w-12 h-12 rounded-full bg-[#101E3D]/10 flex items-center justify-center mb-2">
          <LockOutlined className="text-xl text-[#101E3D]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Sign in to continue</h3>
        <p className="text-sm text-gray-500 mb-4">
          You need a Beldium account to buy or request a quote. Sign in or create an
          account to continue.
        </p>

        <Button
          type="primary"
          block
          size="large"
          className="!bg-[#101E3D]"
          onClick={() => router.push(`/marketplace/login?redirect=${encodeURIComponent(redirectTo)}`)}
        >
          Sign in
        </Button>
        <Button
          block
          size="large"
          className="mt-2"
          onClick={() => router.push(`/marketplace/register?redirect=${encodeURIComponent(redirectTo)}`)}
        >
          Create account
        </Button>
      </div>
    </Modal>
  );
}
