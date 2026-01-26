"use client";
import { getTimeGreeting } from "@/src/utils";
import { Button, Card } from "antd";
import Link from "next/link";

const page = () => {
  const greet = getTimeGreeting();
  return (
    <div>
      <p>
        <span className="italic">{greet},</span>{" "}
        <span className="font-semibold">Akachukwu</span>
      </p>
      <div>
        <Link href="dashboard/transfer" className="my-4! block text-black!">
          Dashboard Content
        </Link>
      </div>
    </div>
  );
};

export default page;
