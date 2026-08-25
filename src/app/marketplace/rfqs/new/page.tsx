"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeftOutlined, CalendarOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, InputNumber, Select } from "antd";
import type { Dayjs } from "dayjs";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import { createRfq, getMineralOptions } from "@/src/features/marketplace/rfqs/rfqs-api";

const { TextArea } = Input;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RequestQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // A listing's "Request for quote" button pre-fills this form via query
  // params (see PricingCard) so the buyer isn't retyping what's already on
  // the listing.
  const [mineralType, setMineralType] = useState(searchParams.get("mineral_type") ?? "");
  const [gradeSpec, setGradeSpec] = useState(searchParams.get("grade_spec") ?? "");
  const [volume, setVolume] = useState<number | null>(() => {
    const raw = searchParams.get("total_weight");
    return raw ? Number(raw) : null;
  });
  const [deliveryDate, setDeliveryDate] = useState<Dayjs | null>(null);
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "");
  // Target price and Additional request have no field on the RFQ model yet
  // (see BACKEND_REQUEST_RFQ_ORDER_FLOW.md) - kept as local UI state only,
  // not sent on submit, so nothing is silently dropped into the wrong column.
  const [additionalRequest, setAdditionalRequest] = useState("");
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [incoterm, setIncoterm] = useState("");

  // Minerals with no verified, routable miner supplying them aren't offered
  // here - picking one that was free-typed before would send the RFQ to
  // NO_MATCH with no miner ever seeing it (see RFQViewSet.mineral_options
  // and RFQDistributionService._get_eligible_miners on the backend).
  const { data: mineralOptions, isLoading: mineralOptionsLoading } = useQuery({
    queryKey: ["marketplace", "mineral-options"],
    queryFn: getMineralOptions,
  });
  const prefilledMineralUnavailable =
    !!mineralType && !mineralOptionsLoading && !!mineralOptions && !mineralOptions.includes(mineralType);

  const mutation = useMutation({
    mutationFn: () =>
      createRfq({
        mineral_type: mineralType,
        grade_spec: gradeSpec,
        total_weight: volume ?? 0,
        delivery_deadline: deliveryDate ? deliveryDate.toISOString() : null,
        destination,
        incoterm,
      }),
  });

  const canSubmit =
    mineralType.trim() &&
    !prefilledMineralUnavailable &&
    gradeSpec.trim() &&
    volume &&
    destination.trim() &&
    incoterm.trim();

  if (mutation.isSuccess) {
    const rfq = mutation.data;
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white border border-[#E9ECF2] rounded-2xl p-8 w-full max-w-md text-center relative">
            <button
              type="button"
              onClick={() => router.push("/marketplace")}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <CloseOutlined />
            </button>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Request Sent Successfully</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your quote request has been sent to the seller. You&apos;ll be notified when they respond.
            </p>
            <Button type="primary" block size="large" onClick={() => router.push(`/marketplace/rfqs/${rfq.id}`)}>
              View my request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <TopBar />

      <div className="flex-1 flex justify-center px-4 py-10">
        <div className="bg-white border border-[#E9ECF2] rounded-2xl p-8 w-full max-w-xl h-fit">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Request for quote</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Share your requirements and get a quote tailored to your order.
          </p>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) mutation.mutate();
            }}
          >
            <Field label="Commodity">
              <Select
                size="large"
                className="!w-full"
                showSearch
                placeholder="Select a mineral"
                loading={mineralOptionsLoading}
                value={mineralType || undefined}
                onChange={(v) => setMineralType(v)}
                options={(mineralOptions ?? []).map((m) => ({ label: m, value: m }))}
                notFoundContent={mineralOptionsLoading ? "Loading…" : "No miners are currently supplying any mineral"}
              />
              {prefilledMineralUnavailable && (
                <p className="text-xs text-amber-600 mt-1.5">
                  No verified miner currently supplies &quot;{mineralType}&quot; - pick one from the list above so
                  your request actually reaches a miner.
                </p>
              )}
            </Field>

            <Field label="Grade / specification">
              <Input
                size="large"
                placeholder="36% Mn"
                value={gradeSpec}
                onChange={(e) => setGradeSpec(e.target.value)}
              />
            </Field>

            <Field label="Volume">
              <InputNumber
                size="large"
                className="!w-full"
                placeholder="0000"
                min={0}
                value={volume}
                onChange={(v) => setVolume(v)}
              />
            </Field>

            <Field label="Delivery Time-frame">
              <DatePicker
                size="large"
                className="!w-full"
                placeholder="Select date"
                suffixIcon={<CalendarOutlined />}
                value={deliveryDate}
                onChange={(v) => setDeliveryDate(v)}
              />
            </Field>

            <Field label="Destination address">
              <Input
                size="large"
                placeholder="Enter address"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </Field>

            <Field label="Additional request">
              <TextArea
                placeholder="Describe request"
                maxLength={500}
                showCount
                rows={4}
                value={additionalRequest}
                onChange={(e) => setAdditionalRequest(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Target price (₦)">
                <InputNumber
                  size="large"
                  className="!w-full"
                  placeholder="0.00"
                  min={0}
                  value={targetPrice}
                  onChange={(v) => setTargetPrice(v)}
                />
              </Field>
              <Field label="Incoterm">
                <Input size="large" placeholder="CIF" value={incoterm} onChange={(e) => setIncoterm(e.target.value)} />
              </Field>
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Couldn&apos;t send your request. Please try again.</p>
            )}

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Send request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="bg-white border-b border-[#E9ECF2]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/marketplace" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
          <ArrowLeftOutlined /> Back to marketplace
        </Link>
        <Link href="/marketplace" className="font-bold text-lg text-[#101E3D]">
          Beldium
        </Link>
      </div>
    </div>
  );
}

export default function RequestQuotePage() {
  return (
    <RequireMarketplaceAuth>
      <Suspense fallback={null}>
        <RequestQuoteContent />
      </Suspense>
    </RequireMarketplaceAuth>
  );
}
