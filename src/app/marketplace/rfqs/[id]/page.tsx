"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Result, Button, Table, Empty, Modal, Steps, Checkbox, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleFilled, ShopOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import { getRfqDetail } from "@/src/features/marketplace/rfqs/rfqs-api";
import {
  formatNaira,
  mockOffersFor,
  mockStatusFor,
  MOCK_STATUS_STYLES,
  MockOffer,
  MockRfqStatus,
} from "@/src/features/marketplace/rfqs/mock-offers";

// Everything on this page beyond the core RFQ fields (mineral, quantity,
// code, deadlines) is mocked - there is no Offer/PurchaseOrder/Escrow/
// Contract model on the backend yet. See mock-offers.ts.

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-gray-500 uppercase text-xs tracking-wide">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function StatusPill({ status }: { status: MockRfqStatus }) {
  const style = MOCK_STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  );
}

type FlowStep = "closed" | "accept" | "purchase_order" | "secure_payment" | "contract";

function AcceptOfferFlowModal({
  offer,
  mineral,
  step,
  onClose,
  onAdvance,
}: {
  offer: MockOffer;
  mineral: string;
  step: FlowStep;
  onClose: () => void;
  onAdvance: (next: FlowStep) => void;
}) {
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signatureTouched, setSignatureTouched] = useState(false);
  const [agreeTouched, setAgreeTouched] = useState(false);

  const stepIndex = { accept: 0, purchase_order: 1, secure_payment: 2, contract: 3 }[
    step as Exclude<FlowStep, "closed">
  ];

  return (
    <Modal open={step !== "closed"} onCancel={onClose} footer={null} width={600} destroyOnHidden>
      {step !== "accept" && (
        <Steps
          size="small"
          current={stepIndex}
          className="!mb-6"
          items={[
            { title: "Offer accepted" },
            { title: "Purchase order" },
            { title: "Secure payment" },
            { title: "Contract" },
          ]}
        />
      )}

      {step === "accept" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Accept this offer?</h2>
          <p className="text-sm text-gray-500 mb-4">
            You&apos;re about to accept the offer from {offer.supplier} for {offer.quantity} DMT of {mineral}
          </p>
          <div className="border border-[#E9ECF2] rounded-xl p-3 flex items-center gap-3 mb-4">
            <Avatar shape="square" className="!bg-purple-100 !text-purple-600 !rounded-lg">
              {offer.supplier[0]}
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 flex items-center gap-1">
                {offer.supplier} <CheckCircleFilled className="text-blue-500 text-xs" />
              </div>
              <div className="text-xs text-gray-500">{offer.location}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Row label="Price / quantity" value={formatNaira(offer.pricePerUnit)} />
            <Row label="Delivery days" value={`${offer.deliveryDays} days`} />
            <Row label="Quantity" value={`${offer.quantity} DMT`} />
            <Row label="Origin" value={offer.origin} />
            <Row label="Total amount" value={formatNaira(offer.totalValue)} />
          </div>
          <div className="bg-amber-50 text-amber-800 text-xs rounded-lg p-3 mb-4">
            Once accepted, this offer will be selected for your RFQ and the transaction will proceed to purchase
            order creation.
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={() => onAdvance("purchase_order")}>
              Accept offer
            </Button>
          </div>
        </>
      )}

      {step === "purchase_order" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Purchase order</h2>
          <p className="text-sm text-gray-500 mb-4">Review the order details carefully before proceeding</p>
          <div className="grid grid-cols-2 gap-x-8 bg-gray-50 rounded-xl p-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">Supplier</div>
              <div className="font-medium text-gray-900 mb-3">{offer.supplier}</div>
              <div className="text-xs text-gray-500 uppercase mb-1">Quantity</div>
              <div className="font-medium text-gray-900">{offer.quantity} MT</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">Unit price</div>
              <div className="font-medium text-gray-900 mb-3">{formatNaira(offer.pricePerUnit)} / MT</div>
              <div className="text-xs text-gray-500 uppercase mb-1">Total</div>
              <div className="font-bold text-gray-900">{formatNaira(offer.totalValue)}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => onAdvance("accept")}>Back</Button>
            <Button type="primary" onClick={() => onAdvance("secure_payment")}>
              Proceed to contract
            </Button>
          </div>
        </>
      )}

      {step === "secure_payment" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Secure payment</h2>
          <p className="text-sm text-gray-500 mb-4">
            Secure your funds in Beldium Escrow. Your payment will be held securely and released to the supplier
            according to transaction type
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Amount to secure</span>
              <span className="text-lg font-bold text-gray-900">{formatNaira(offer.totalValue)}</span>
            </div>
            <Row label="Commodity" value={mineral} />
            <Row label="Quantity" value={`${offer.quantity} MT`} />
            <Row label="Escrow fees" value={formatNaira(30000)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => onAdvance("purchase_order")}>Back</Button>
            <Button type="primary" onClick={() => onAdvance("contract")}>
              Proceed to contract
            </Button>
          </div>
        </>
      )}

      {step === "contract" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Accept &amp; sign contract</h2>
          <p className="text-sm text-gray-500 mb-4">
            By signing, you confirm that you agree to the terms of this transaction
          </p>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mb-4">
            <Row label="Supplier" value={offer.supplier} />
            <Row label="Contract price" value={formatNaira(offer.totalValue)} />
          </div>
          <div className="text-xs text-gray-500 uppercase mb-1">Signature</div>
          <p className="text-xs text-gray-400 mb-2">Type full-name as electric signature</p>
          <input
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            onBlur={() => setSignatureTouched(true)}
            placeholder="Enter name"
            className="w-full border border-[#E9ECF2] rounded-lg px-3 py-2 text-sm mb-1"
          />
          {signatureTouched && !signature && (
            <p className="text-xs text-red-500 mb-2">Please input your name before you continue</p>
          )}
          <label className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mt-3 mb-1 text-xs text-gray-600">
            <Checkbox
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setAgreeTouched(true);
              }}
            />
            I agree to the terms of this contract and acknowledge that typing my name constitutes my electronic
            signature for this transaction in accordance with applicable trade regulations.
          </label>
          {agreeTouched && !agreed && (
            <p className="text-xs text-red-500 mb-2">Please check the box to confirm your agreement.</p>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <Button onClick={() => onAdvance("secure_payment")}>Back</Button>
            <Button
              type="primary"
              onClick={() => {
                setSignatureTouched(true);
                setAgreeTouched(true);
                if (signature && agreed) onAdvance("closed");
              }}
            >
              Save &amp; sign contract
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function CloseRfqModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={440} centered destroyOnHidden>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Close this RFQ?</h2>
      <p className="text-sm text-gray-500 mb-5">
        Closing this request will stop new offers from being submitted, and you won&apos;t be able to accept any new
        offers.
      </p>
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button danger type="primary" onClick={onConfirm}>
          Close offer
        </Button>
      </div>
    </Modal>
  );
}

function RfqDetailContent({ id }: { id: string }) {
  const { data: rfq, isLoading } = useQuery({
    queryKey: ["marketplace", "rfq-detail", id],
    queryFn: () => getRfqDetail(id),
  });

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closedOverride, setClosedOverride] = useState(false);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [flowOffer, setFlowOffer] = useState<MockOffer | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>("closed");

  const offers = rfq ? mockOffersFor(rfq) : [];
  const baseStatus = rfq ? mockStatusFor(rfq.id) : "open";
  const status: MockRfqStatus = closedOverride ? "closed" : acceptedOfferId ? "accepted" : baseStatus;
  const acceptedOffer = offers.find((o) => o.id === acceptedOfferId) ?? (status === "accepted" ? offers[0] : null);

  const columns: ColumnsType<MockOffer> = [
    { title: "Mineral", key: "mineral", render: () => rfq?.mineral_type },
    { title: "Supplier", dataIndex: "supplier", key: "supplier" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Price/unit",
      dataIndex: "pricePerUnit",
      key: "pricePerUnit",
      render: (v: number) => formatNaira(v),
    },
    {
      title: "Total value",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (v: number) => formatNaira(v),
    },
    {
      title: "Status",
      key: "action",
      render: (_, record) => (
        <Button
          size="small"
          shape="round"
          disabled={status !== "under_review"}
          onClick={() => {
            setFlowOffer(record);
            setFlowStep("accept");
          }}
        >
          Accept offer
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
        <div className="text-sm text-gray-500 mb-3">
          <Link href="/marketplace/rfqs" className="hover:underline">
            My request&apos;s (RFQ&apos;s)
          </Link>{" "}
          <span className="mx-1">›</span> {rfq?.mineral_type ?? "…"}
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !rfq ? (
          <Result
            status="404"
            title="RFQ not found"
            extra={
              <Link href="/marketplace/rfqs">
                <Button type="primary">Back to RFQ&apos;s</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {rfq.mineral_type}
                <span className="text-gray-400 font-normal text-base">{rfq.rfq_code}</span>
                <StatusPill status={status} />
              </h1>
              <div className="flex items-center gap-2">
                {status === "accepted" ? (
                  <Button type="primary">Proceed to order</Button>
                ) : status === "open" || status === "under_review" ? (
                  <>
                    <Button icon={<ShopOutlined />}>Share RFQ</Button>
                    <Button danger onClick={() => setCloseModalOpen(true)}>
                      Close RFQ
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Last updated Today, 9:20 AM</p>

            <div className="bg-white border border-[#E9ECF2] rounded-xl p-5 mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Request specification</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-6 mb-4">
                <Row label="Mineral" value={rfq.mineral_type} />
                <Row label="Quantity" value={`${Number(rfq.total_weight).toLocaleString()} DMT`} />
                <Row label="Frequency" value="One-time buy" />
                <Row
                  label="Valid until"
                  value={rfq.response_deadline ? new Date(rfq.response_deadline).toLocaleDateString() : "—"}
                />
                <Row label="Location" value={rfq.destination} />
                <Row label="Purity" value={rfq.grade_spec || "—"} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Additional requirement</h3>
              <p className="text-sm text-gray-500">
                {rfq.grade_spec || "No additional requirements specified."}
              </p>
            </div>

            {acceptedOffer ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
                  <h2 className="font-semibold text-gray-900 mb-3">Offer accepted from</h2>
                  <div className="flex items-center justify-between border border-[#E9ECF2] rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar shape="square" className="!bg-purple-100 !text-purple-600 !rounded-lg">
                        {acceptedOffer.supplier[0]}
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          {acceptedOffer.supplier} <CheckCircleFilled className="text-blue-500 text-xs" />
                        </div>
                        <div className="text-xs text-gray-500">{acceptedOffer.location}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">View profile →</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Miner quote specification</h3>
                  <div className="grid grid-cols-2 gap-x-6">
                    <Row label="Mineral" value={rfq.mineral_type} />
                    <Row label="Quantity" value={`${acceptedOffer.quantity} DMT`} />
                    <Row label="Price per DMT" value={formatNaira(acceptedOffer.pricePerUnit)} />
                    <Row label="Total amount" value={formatNaira(acceptedOffer.totalValue)} />
                  </div>
                </div>
                <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
                  <h2 className="font-semibold text-gray-900 mb-3">Material documents</h2>
                  {["Sales contract", "Assay reports", "Certificate of analysis (COA)", "Export documentation"].map(
                    (doc) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between border-b border-[#E9ECF2] last:border-0 py-2.5 text-sm"
                      >
                        <span className="text-gray-700">{doc}</span>
                        <span className="flex items-center gap-3 text-gray-400">
                          <EyeOutlined />
                          <DownloadOutlined />
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : offers.length === 0 ? (
              <div className="bg-white border border-[#E9ECF2] rounded-xl py-16">
                <Empty
                  description={
                    <div>
                      <p className="text-gray-900 font-medium mb-1">You have no offers yet</p>
                      <p className="text-sm text-gray-500">
                        Your request is live and suppliers can submit offers based on your requirement
                      </p>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="bg-white border border-[#E9ECF2] rounded-xl overflow-hidden">
                <div className="px-5 pt-4 font-semibold text-gray-900">({offers.length}) Offers</div>
                <Table<MockOffer>
                  rowKey="id"
                  columns={columns}
                  dataSource={offers}
                  pagination={{ pageSize: 4 }}
                />
              </div>
            )}
          </>
        )}
      </div>

      <MarketplaceFooter />

      <CloseRfqModal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={() => {
          setClosedOverride(true);
          setCloseModalOpen(false);
        }}
      />

      {flowOffer && (
        <AcceptOfferFlowModal
          offer={flowOffer}
          mineral={rfq?.mineral_type ?? ""}
          step={flowStep}
          onClose={() => {
            setFlowStep("closed");
            setFlowOffer(null);
          }}
          onAdvance={(next) => {
            if (next === "closed") {
              setAcceptedOfferId(flowOffer.id);
            }
            setFlowStep(next);
          }}
        />
      )}
    </div>
  );
}

export default function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireMarketplaceAuth>
      <RfqDetailContent id={id} />
    </RequireMarketplaceAuth>
  );
}
