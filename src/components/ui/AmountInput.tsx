"use client";

import { formatCurrency, formatCurrencyAmount } from "@/utils";
import { Form, Input } from "antd";
import { useState } from "react";

interface AmountInputProps {
  value?: string;
  onChange?: (value: string) => void;
  prefix: string;
}

export function AmountInput({ value, onChange, prefix }: AmountInputProps) {
  const [localValue, setLocalValue] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // allow only numbers and dot
    const rawValue = e.target.value.replace(/[^0-9.]/g, "");
    setLocalValue(rawValue);
    if (onChange) onChange(rawValue);
  };

  const handleBlur = () => {
    const formatted = formatCurrencyAmount(localValue);
    setLocalValue(formatted);
    if (onChange) onChange(formatted);
  };

  return (
    <Input
      prefix={prefix}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="0.00"
      className="border-none! outline-none! focus:border-none! focus:outline-none!"
    />
  );
}
