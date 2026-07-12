// steps/CreateAccountStep.tsx
"use client";

import { useState } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { SocialButton } from "../ui/SocialButton";
import { TextField } from "../ui/TextField";
import { ArrowLeftIcon, ArrowRightIcon } from "../ui/ArrowIcon";

export function CreateAccountStep() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = name && phone && email && password;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-gray-700">
          <ArrowLeftIcon />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <SocialButton provider="google" />
        <SocialButton provider="facebook" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <TextField
        label="Full name or Company name"
        placeholder="Enter your full name or company name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Phone number (primary)"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <TextField
        label="Email address"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Create password"
        placeholder="Create your new password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        endAdornment={
          <button type="button" onClick={() => setShowPassword((s) => !s)}>
            eye
          </button>
        }
      />

      <Button
        type="primary"
        block
        size="large"
        disabled={!canSubmit}
        className="text-sm! h-12! flex items-center justify-center gap-2 bg-slate-900! border-slate-900! disabled:bg-gray-300! disabled:border-gray-300!"
      >
        Create my account
        <ArrowRightIcon />
      </Button>
    </div>
  );
}