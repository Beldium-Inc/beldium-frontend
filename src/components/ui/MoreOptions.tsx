"use client";
import { Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";

type Option = {
  key: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
};

type MoreOptionsProps = {
  options: Option[];
};

export default function MoreOptions({ options }: MoreOptionsProps) {
  const items: MenuProps["items"] = options.map((opt) => ({
    key: opt.key,
    label: opt.label,
    danger: opt.danger,
    onClick: opt.onClick,
  }));

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Button type="text" icon={<MoreOutlined className="text-lg" />} />
    </Dropdown>
  );
}
