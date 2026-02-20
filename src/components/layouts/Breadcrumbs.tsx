"use client";

import { Breadcrumb } from "antd";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const title = segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      title:
        index === segments.length - 1 ? (
          title
        ) : (
          <Link href={href}>{title}</Link>
        ),
    };
  });

  return <Breadcrumb items={items} />;
}
