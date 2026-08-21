"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Checkbox } from "antd";
import type { MarketplaceRole } from "@/src/features/marketplace/auth/marketplace-auth-api";

// Miner is deliberately excluded: miners onboard through the main app
// (app.beldium.com), not the public marketplace signup.
const ROLES: { value: MarketplaceRole; label: string; description: string }[] = [
  {
    value: "buyer",
    label: "Buyer",
    description: "Buys minerals, materials or manufactured products.",
  },
  {
    value: "oem",
    label: "OEM",
    description: "Manufacturer sourcing materials or components for its products.",
  },
  {
    value: "off_taker",
    label: "Off-taker",
    description: "Enters long-term or structured supply agreements.",
  },
];

const MAX_ROLES = 2;

export default function RoleStep({
  value,
  onContinue,
  onBack,
}: {
  value: MarketplaceRole[];
  onContinue: (roles: MarketplaceRole[]) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<MarketplaceRole[]>(value);

  const toggle = (role: MarketplaceRole) => {
    setSelected((prev) => {
      if (prev.includes(role)) return prev.filter((r) => r !== role);
      if (prev.length >= MAX_ROLES) return prev;
      return [...prev, role];
    });
  };

  return (
    <div className="flex flex-col items-center text-center">
      <Image src="/assets/images/logo.png" alt="Beldium" width={40} height={40} />
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mt-4">How will you use Beldium?</h2>
      <p className="text-sm text-gray-500 mt-1 mb-1">Choose up to 2 roles that best match.</p>
      <p className="text-xs text-gray-400 mb-6">{selected.length}/{MAX_ROLES} selected</p>

      <div className="grid grid-cols-2 gap-4 w-full text-left">
        {ROLES.map((role) => {
          const isSelected = selected.includes(role.value);
          const isDisabled = !isSelected && selected.length >= MAX_ROLES;
          return (
            <button
              key={role.value}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(role.value)}
              className={`border rounded-xl p-4 flex flex-col gap-1.5 transition-colors ${
                isSelected
                  ? "border-[#101E3D] border-2"
                  : isDisabled
                    ? "border-gray-100 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Checkbox checked={isSelected} disabled={isDisabled} className="pointer-events-none" />
                <span className="font-medium text-gray-900 text-[15px]">{role.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>
            </button>
          );
        })}
      </div>

      <Button
        type="primary"
        block
        size="large"
        disabled={selected.length === 0}
        className="!bg-[#101E3D] !text-white !rounded-xl !h-12 !mt-6"
        onClick={() => selected.length > 0 && onContinue(selected)}
      >
        Continue
      </Button>
      <Button block size="large" className="!rounded-xl !h-12 !mt-3" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
