"use client";

import { Modal, Button } from "antd";
import clsx from "clsx";
import Image from "next/image";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
  size?: number;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Okay",
  cancelText = "Cancel",
  showCancel = false,
  loading = false,
  size = 420,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      styles={{
        body: { padding: "1.5rem" },
      }}
      className="rounded-xl"
      width={size}
    >
      <div className="flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <Image
          src="/assets/icons/trash-fill-red-icon.svg"
          height={120}
          width={120}
          alt="logo"
        />

        <h2 className="text-lg font-semibold">{title}</h2>

        {description && <p className="text-sm text-gray-600">{description}</p>}

        <div
          className={clsx(
            "mt-6 flex w-full gap-3",
            showCancel ? "justify-between" : "justify-center",
          )}
        >
          <Button
            onClick={onClose}
            type="default"
            className="w-full py-5! text-black"
          >
            cancel
          </Button>

          <Button
            type="primary"
            loading={loading}
            onClick={onConfirm ?? onClose}
            className="w-full py-5! bg-red-600!"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
