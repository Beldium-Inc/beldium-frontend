import { Button } from "antd";
import Image from "next/image";
import { useOnboardingStore } from "../onboarding.store";
import { AuditOutlined, ToolOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export function RoleSelection({
  onNext,
}: {
  onNext: () => void;
}) {
  const { setData } = useOnboardingStore();
  const router = useRouter();

  const chooseRole = (role: "miner" | "partner") => {
    setData({ role });
    onNext();
  };

  return (
    <div className="w-full py-12 lg:py-16 flex flex-col gap-8 bg-gray-50 rounded-2xl">
      <div className="relative w-full h-12">
        {/* <Button
          type="text"
          onClick={() => router.back()}
          className="absolute left-0 top-0"
        >
          <Image src="/assets/icons/arrow-icon.svg" height={24} width={24} alt="back" />
        </Button> */}
        <div className="flex justify-center">
          <Image src="/assets/images/logo.png" height={36} width={36} alt="logo" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-semibold">How Will You Use Beldium?</h2>
        <p className="text-sm text-gray-500">
          Choose your role to start with the onboarding experience built for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-8 max-w-6xl mx-auto px-2 lg:px-0">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center h-9 w-9 rounded-md bg-indigo-100 text-indigo-600 text-lg">
              <ToolOutlined />
            </span>
            <h3 className="text-xl font-semibold">Miner</h3>
          </div>

          <div className="flex-1">
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span>Register mining operations</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span>Receive compliance support</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span>Access verified market pathways</span>
              </li>
            </ul>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-xs text-gray-500">
                You should choose Miner if you are involved in mining, processing, or supplying minerals
              </p>
            </div>
          </div>

          <Button
            type="primary"
            block
            size="large"
            onClick={() => chooseRole("miner")}
            className="text-sm! mt-4 lg:mt-auto"
          >
            Continue as Miner
            <Image
              src="/assets/icons/arrow-white-icon.svg"
              height={20}
              width={20}
              alt="arrow"
            />
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center h-9 w-9 rounded-md bg-yellow-100 text-yellow-600 text-lg">
              <AuditOutlined />
            </span>
            <h3 className="text-xl font-semibold">Regulator or Compliance Partner</h3>
          </div>

          <div className="flex-1">
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                <span>Support miner compliance</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                <span>Provide regulatory services</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                <span>Provide regulatory services</span>
              </li>
            </ul>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-xs text-gray-500">
                Choose this if your organisation provides legal, environmental, ESG, or regulatory services.
              </p>
            </div>
          </div>

          <Button
            type="primary"
            block
            size="large"
            onClick={() => chooseRole("partner")}
            className="text-sm! mt-4 lg:mt-auto"
          >
            Continue as Partner
            <Image
              src="/assets/icons/arrow-white-icon.svg"
              height={20}
              width={20}
              alt="arrow"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
