"use client";

import { useRef, useState } from "react";

export default function OtpInputField({
  length = 6,
  onComplete,
}: {
  length?: number;
  onComplete?: (otp: string) => void;
}) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (next.join("").length === length) {
      onComplete?.(next.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length)
      .split("");

    const next = [...otp];
    pasted.forEach((digit, i) => (next[i] = digit));
    setOtp(next);

    inputsRef.current[pasted.length - 1]?.focus();
    onComplete?.(next.join(""));
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el!;
          }}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          placeholder="-"
          className="
            w-12 h-14
            text-center text-lg font-semibold
            border border-gray-400 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400
            transition
          "
        />
      ))}
    </div>
  );
}
