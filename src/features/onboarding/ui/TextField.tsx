// ui/TextField.tsx
"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export const TextField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; endAdornment?: ReactNode }
>(({ label, endAdornment, className, ...props }, ref) => {
  return (
    <div className="mb-5">
      <label className="block text-sm text-gray-800 mb-2">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          className={`w-full h-12 rounded-lg border border-gray-300 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-500 ${endAdornment ? "pr-11" : ""} ${className ?? ""}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {endAdornment}
          </div>
        )}
      </div>
    </div>
  );
});
TextField.displayName = "TextField";