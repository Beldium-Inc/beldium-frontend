"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useToastStore, Toast } from "@/src/store/toast.store";
import clsx from "clsx";

function ToastItem({ toast }: { toast: Toast }) {
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    const timer = setTimeout(() => hide(toast.id), toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, hide]);

  return (
    <div
      className={clsx(
        "rounded-md shadow-lg p-4 mb-3 w-80 text-sm text-white",
        toast.type === "success" && "bg-green-600",
        toast.type === "error" && "bg-red-600",
        toast.type === "info" && "bg-gray-900"
      )}
      role="alert"
    >
      {toast.message}
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[1000]">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  );
}
