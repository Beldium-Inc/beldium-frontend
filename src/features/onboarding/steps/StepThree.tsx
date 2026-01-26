// Step1.tsx
import { AmountInput } from "@/components/ui/AmountInput";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { COUNTRIES } from "@/constants";
import {
  Input,
  Button,
  Form,
  Checkbox,
  Modal,
  Select,
  Col,
  DatePicker,
  Row,
} from "antd";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useOnboardingStore } from "../onboarding.store";
import clsx from "clsx";
import NotificationModal from "@/components/ui/modals/NotificationModal";
import { useUIStore } from "@/store/ui/ui.store";
import { PasswordRules } from "@/components/ui/PasswordRules";
import { useRouter } from "next/navigation";

export function StepThree({ data, onBack }: { data: any; onBack: any }) {
  const { step, totalSteps } = useOnboardingStore();
  const { alertModalOpen, openAlertModal, closeAlertModal } = useUIStore();
  const [form] = Form.useForm();
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <div className="w-full py-10 flex flex-col gap-5">
      <div className="w-full flex mb-8 justify-between items-center">
        <Button type="text" onClick={onBack}>
          <Image
            src="/assets/icons/arrow-icon.svg"
            height={24}
            width={24}
            alt="arrow"
          />
        </Button>
        <div className="flex gap-4 items-start">
          {Array(totalSteps)
            ?.fill(step)
            .map((_, index) => (
              <span
                key={index}
                className={clsx(
                  "h-2! w-18 bg-gray-300 rounded-lg",
                  index <= step - 1 && "bg-primary"
                )}
              ></span>
            ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold!">Add Basic Info</h2>
        <p className="text-sm text-gray-500">
          Enter your details exactly as they appear on your government-issued
          ID.
        </p>
      </div>
      <Form layout="vertical">
        <Row gutter={10}>
          <Col xs={24} md={24}>
            <Form.Item
              label="BVN"
              name="bvn"
              rules={[
                { required: true, message: "BVN is required" },
                {
                  pattern: /^\d{10}$/,
                  message: "BVN must be exactly 10 digits",
                },
              ]}
            >
              <Input
                maxLength={10}
                inputMode="numeric"
                placeholder="Enter BVN number"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                { required: true, message: "First name is required" },
                { min: 2, message: "Minimum 2 characters" },
              ]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={24}>
            <Form.Item
              label="Middle Name"
              name="middleName"
              rules={[{ min: 2, message: "Minimum 2 characters" }]}
            >
              <Input placeholder="Enter middle name (optional)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={24}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                { required: true, message: "Last name is required" },
                { min: 2, message: "Minimum 2 characters" },
              ]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Date of Birth"
              name="dob"
              rules={[{ required: true, message: "Date of birth is required" }]}
            >
              <DatePicker
                className="w-full"
                placeholder="Select date of birth"
                disabledDate={(current: any) => current && current > Date.now()}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Gender is required" }]}
            >
              <Select placeholder="Select gender">
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <div className="mt-8">
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            onClick={() => router.push("/dashboard")}
          >
            Finish
          </Button>
        </div>
      </Form>
    </div>
  );
}
