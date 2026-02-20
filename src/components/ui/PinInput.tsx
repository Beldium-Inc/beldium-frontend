"use client";

import { Input, Space } from "antd";
import type { InputRef } from "antd";
import { useRef } from "react";

type PinInputProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function PinInput({ value = "", onChange }: PinInputProps) {
  const inputsRef = useRef<Array<InputRef | null>>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;

    const pinArray = value.split("");
    pinArray[index] = val;
    const newPin = pinArray.join("").slice(0, 4);

    onChange?.(newPin);

    if (val && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Space>
      {[0, 1, 2, 3].map((i) => (
        <Input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          placeholder="-"
          className="w-12 h-12 text-center rounded-lg border-0! bg-transparent! border-b-3! border-gray-500! font-semibold! text-2xl! outline-0!"
        />
      ))}
    </Space>
  );
}
