"use client";

import { Modal, Button } from "antd";
import clsx from "clsx";
import React from "react";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;

  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function CustomModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = false,
  loading = false,
  size = "sm",
}: CustomModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      className={clsx("rounded-xl", SIZE_CLASS[size])}
      styles={{
        body: { padding: "1.5rem" },
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        {(title || description) && (
          <div className="space-y-1 flex flex-col items-center">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}

            {description && (
              <p className="text-sm text-gray-500 text-center">{description}</p>
            )}
          </div>
        )}

        {/* Content */}
        {children && <div>{children}</div>}

        {/* Footer */}
        {(showCancel || onConfirm) && (
          <div className="flex justify-end gap-3 pt-4">
            {showCancel && (
              <Button htmlType="button" onClick={onClose}>
                {cancelText}
              </Button>
            )}

            {onConfirm && (
              <Button
                type="primary"
                block
                size="large"
                loading={loading}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
