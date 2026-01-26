"use client";

import { COUNTRIES } from "@/constants";
import { Select } from "antd";
import Image from "next/image";
import clsx from "clsx";

interface CountrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  type?: string;
}

export function CountrySelect({
  value,
  onChange,
  className,
  type = "country",
}: CountrySelectProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      optionLabelProp="label"
      allowClear={false}
      className={clsx("", className)}
      options={COUNTRIES.map((country) => ({
        value: type === "country" ? country?.name : country?.dialCode,
        label: (
          <div className="flex items-center gap-2" key={country?.iso3}>
            <Image
              src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
              alt={country.name}
              width={20}
              height={20}
              className="rounded-full w-5 h-5"
            />
            <span className="font-medium ml-0">
              {type === "country" ? country?.iso3 : country?.dialCode}
            </span>
          </div>
        ),
      }))}
    />
  );
}
