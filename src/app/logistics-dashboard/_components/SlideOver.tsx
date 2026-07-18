"use client";

export default function SlideOver({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
        {children}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
