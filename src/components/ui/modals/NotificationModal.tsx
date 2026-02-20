"use client";

import { Modal, Button } from "antd";
import clsx from "clsx";
import Image from "next/image";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  type?: NotificationType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
  size?: number;
}

export default function NotificationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  type,
  confirmText = "Okay",
  cancelText = "Cancel",
  showCancel = false,
  loading = false,
  size = 420,
}: NotificationModalProps) {
  const successIcon = "/assets/icons/success-icon.svg";
  const errorIcon = "/assets/icons/failed-icon.svg";
  const lockIcon = "/assets/icons/lock.svg";
  const warningIcon = "/assets/icons/warning-fill-red-icon.svg";
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
        {/* {ICON_MAP[type]} */}
        <Image
          src={
            type === "success"
              ? successIcon
              : type === "error"
              ? errorIcon
              : type === "warning"
              ? warningIcon
              : lockIcon
          }
          height={120}
          width={120}
          alt="logo"
        />

        <h2 className="text-lg font-semibold">{title}</h2>

        {description && <p className="text-sm text-gray-600">{description}</p>}

        <div
          className={clsx(
            "mt-6 flex w-full gap-3",
            showCancel ? "justify-between" : "justify-center"
          )}
        >
          {showCancel && (
            <Button onClick={onClose} className="w-full py-5! text-black">
              {cancelText}
            </Button>
          )}

          <Button
            type="primary"
            loading={loading}
            onClick={onConfirm ?? onClose}
            className={clsx(
              "w-full py-5!",
              type === "warning" && "bg-red-600! text-white!"
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
