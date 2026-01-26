"use client";

import { Pagination as AntPagination } from "antd";

type PaginationProps = {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
};

export default function Pagination({
  current,
  pageSize,
  total,
  onChange,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center py-4">
      <span className="text-sm text-gray-600">
        Showing {(current - 1) * pageSize + 1}–
        {Math.min(current * pageSize, total)} of {total}
      </span>

      <AntPagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger={false}
        className="custom-pagination"
      />
    </div>
  );
}
