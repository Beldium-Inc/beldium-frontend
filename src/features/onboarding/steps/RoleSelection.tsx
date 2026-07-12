"use client";

import { useEffect } from "react";
import { Button } from "antd";
import Image from "next/image";
import { useOnboardingStore } from "../onboarding.store";
import { useRouter } from "next/navigation";

function MinerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PartnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 9.5h8M8 13h8M8 16.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.5 9.3a2.5 2.5 0 0 1 4.8 1c0 1.5-2.3 1.7-2.3 3.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RoleSelection({
  onNext,
}: {
  onNext: () => void;
}) {
  const { setData } = useOnboardingStore();
  const router = useRouter();

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const chooseRole = (role: "miner" | "partner") => {
    setData({ role });
    onNext();
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-50">
      <header className="w-full bg-white flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-center gap-2">
          <Image src="/assets/images/logo.png" height={26} width={26} alt="Beldium logo" />
          <span className="text-lg font-semibold text-gray-900">Beldium</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 lg:py-10 flex flex-col justify-start lg:justify-center">
        <div className="relative w-full max-w-5xl mx-auto h-6 mb-4 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 flex items-center justify-center h-8 w-8 text-gray-700"
          >
            <ArrowLeftIcon />
          </button>
        </div>

        <div className="text-center px-2 mb-8 flex-shrink-0">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            How Will You Use Beldium?
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Choose your role to start with the onboarding experience built for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-5 lg:gap-20 max-w-3xl mx-auto w-full flex-shrink-0">
          {/* Miner card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-7 lg:p-8 shadow-sm flex flex-col h-full">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 mb-5 flex-shrink-0 self-start">
              <MinerIcon />
            </span>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Miner</h3>

            <div className="flex-1">
              <ul className="space-y-2.5 mb-4">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                  <span>Register mining operations</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                  <span>Receive compliance support</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                  <span>Access verified market pathways</span>
                </li>
              </ul>

              <div className="border-t border-gray-200 pt-20 mb-4">
                <p className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                  <HelpIcon />
                  <span>
                    You should choose Miner if you are involved in mining, processing, or supplying minerals
                  </span>
                </p>
              </div>
            </div>

            <Button
              type="primary"
              block
              size="large"
              onClick={() => chooseRole("miner")}
              className="text-sm! mt-4 lg:mt-auto flex items-center justify-center gap-2 bg-slate-900! border-slate-900! hover:bg-slate-800! h-11!"
            >
              Continue as Miner
              <ArrowRightIcon />
            </Button>
          </div>

          {/* Partner card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-7 lg:p-8 shadow-sm flex flex-col h-full">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 text-amber-600 mb-5 flex-shrink-0 self-start">
              <PartnerIcon />
            </span>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 leading-snug">
              Regulator or Compliance Partner
            </h3>

            <div className="flex-1">
              <ul className="space-y-2.5 mb-4">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>Support miner compliance</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>Provide regulatory services</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>Provide regulatory services</span>
                </li>
              </ul>

              <div className="border-t border-gray-200 pt-10 mb-4">
                <p className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                  <HelpIcon />
                  <span>
                    Choose this if your organisation provides legal, environmental, ESG, or regulatory services.
                  </span>
                </p>
              </div>
            </div>

            <Button
              type="primary"
              block
              size="large"
              onClick={() => chooseRole("partner")}
              className="text-sm! mt-4 lg:mt-auto flex items-center justify-center gap-2 bg-slate-900! border-slate-900! hover:bg-slate-800! h-11!"
            >
              Continue as Partner
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}