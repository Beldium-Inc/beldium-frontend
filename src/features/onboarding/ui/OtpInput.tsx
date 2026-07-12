// ui/OtpInput.tsx
"use client";

import { useRef } from "react";

export function OtpInput({
  length = 4,
  values,
  onChange,
  autoFocus = false,
}: {
  length?: number;
  values: string[];
  onChange: (values: string[]) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[index] = digit;
    onChange(next);
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={values[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          className="h-16 w-16 rounded-lg border border-gray-300 text-center text-xl focus:outline-none focus:border-gray-500"
        />
      ))}
    </div>
  );
}