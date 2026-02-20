"use client";
import Image from "next/image";
import clsx from "clsx";

export default function LoadingOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message?: string;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-white rounded-xl p-6 shadow-lg">
        <Image src="/assets/images/logo.png" height={36} width={36} alt="logo" />
        <div
          className={clsx(
            "h-8 w-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin"
          )}
        />
        <p className="text-sm text-gray-700">{message || "Please wait..."}</p>
      </div>
    </div>
  );
}
