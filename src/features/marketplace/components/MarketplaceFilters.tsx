"use client";

import { Button, Drawer, Input, Select, Slider } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useState } from "react";

export type MarketplaceFilterValues = {
  country: string | null;
  state_of_operation: string | null;
  mining_method: string | null;
  complianceScoreMin: number;
};

const MINING_METHOD_OPTIONS = [
  { label: "All methods", value: undefined },
  { label: "Open Pit", value: "open_pit" },
  { label: "Shaft / Underground", value: "shaft_or_underground" },
  { label: "Exploration", value: "exploration" },
];

function FilterFields({
  values,
  onChange,
}: {
  values: MarketplaceFilterValues;
  onChange: (next: Partial<MarketplaceFilterValues>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-medium text-gray-500 mb-1">Country</div>
        <Input
          placeholder="e.g. Nigeria"
          value={values.country ?? ""}
          onChange={(e) => onChange({ country: e.target.value || null })}
          allowClear
        />
      </div>

      <div>
        <div className="text-xs font-medium text-gray-500 mb-1">State</div>
        <Input
          placeholder="e.g. Kwara"
          value={values.state_of_operation ?? ""}
          onChange={(e) => onChange({ state_of_operation: e.target.value || null })}
          allowClear
        />
      </div>

      <div>
        <div className="text-xs font-medium text-gray-500 mb-1">Mining Method</div>
        <Select
          className="w-full"
          placeholder="All methods"
          value={values.mining_method ?? undefined}
          allowClear
          onChange={(v) => onChange({ mining_method: v ?? null })}
          options={MINING_METHOD_OPTIONS}
        />
      </div>

      <div>
        <div className="text-xs font-medium text-gray-500 mb-1">
          Minimum compliance score: {values.complianceScoreMin}%
        </div>
        <Slider
          min={0}
          max={100}
          value={values.complianceScoreMin}
          onChange={(v) => onChange({ complianceScoreMin: v as number })}
        />
        <div className="text-[11px] text-gray-400">
          Applies only to compliance scores already loaded on this page.
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceFilters({
  values,
  onChange,
}: {
  values: MarketplaceFilterValues;
  onChange: (next: Partial<MarketplaceFilterValues>) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="md:hidden mb-4">
        <Button icon={<FilterOutlined />} onClick={() => setDrawerOpen(true)} block>
          Filters
        </Button>
        <Drawer
          title="Filters"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <FilterFields values={values} onChange={onChange} />
        </Drawer>
      </div>

      <div className="hidden md:block w-64 shrink-0 rounded-xl border border-[#E9ECF2] bg-white p-4 h-fit">
        <div className="font-semibold text-gray-900 mb-4">Filters</div>
        <FilterFields values={values} onChange={onChange} />
      </div>
    </>
  );
}
