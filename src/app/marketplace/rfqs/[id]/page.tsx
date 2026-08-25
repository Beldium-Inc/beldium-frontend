"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Result, Button, Table, Empty, Modal, Steps, Checkbox, Avatar, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleFilled,
  ShopOutlined,
  EyeOutlined,
  DownloadOutlined,
  BankOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import {
  acceptRfqQuote,
  BankTransferInstructions,
  declineRfqQuote,
  fundEscrow,
  getRfqDetail,
  getRfqQuotes,
  RfqQuote,
} from "@/src/features/marketplace/rfqs/rfqs-api";
import { useMarketplaceAuth } from "@/src/features/marketplace/auth/use-marketplace-auth";
import { showToast } from "@/src/store/toast.store";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatNaira,
  MOCK_STATUS_STYLES,
  MockOffer,
  MockRfqStatus,
} from "@/src/features/marketplace/rfqs/mock-offers";

// The request -> distribute -> notify -> miner quotes -> buyer accepts
// half of this flow is real (RFQAssignment.quoted_price/quoted_quantity,
// /rfq-assignments/quotes/, accept-quote/decline-quote - see
// BACKEND_REQUEST_RFQ_ORDER_FLOW.md item 1, now closed). Purchase
// order/escrow/contract past that point are still mocked locally -
// there is no real payment gateway or Escrow/Contract model yet (item 4
// in that doc). Delivery days and transport mode aren't part of a miner's
// quote yet either, so they're filled with placeholders in
// quoteToOffer() below rather than pretending the miner specified them.
//
// Terminology: the buyer never deals with a "supplier" directly - Beldium
// collects payment into its own escrow account and disburses it to the
// miner(s) that fulfil the order, so every label here says "miner", not
// "supplier".

function quoteToOffer(quote: RfqQuote, destination: string): MockOffer {
  const pricePerUnit = Number(quote.quoted_price);
  const quantity = Number(quote.quoted_quantity);
  return {
    id: quote.id,
    miner: quote.miner_name,
    location: quote.miner_location,
    quantity,
    pricePerUnit,
    totalValue: pricePerUnit * quantity,
    deliveryDays: 14,
    origin: quote.miner_location,
    destination,
    transportMode: "Road",
    verified: true,
  };
}

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

type FlowStep =
  | "closed"
  | "accept"
  | "purchase_order"
  | "review_purchase_order"
  | "secure_payment"
  // Real bank transfer instructions from POST /rfqs/{id}/fund-escrow/ -
  // there's no real payment gateway on this path (bank transfer only, per
  // product decision), so this is not a fake "processing" spinner that
  // auto-advances; it's the actual reference to pay against.
  | "bank_transfer"
  // The buyer has claimed they sent it - NOT the same as escrow actually
  // being locked. Named "transfer_submitted" rather than the Figma design's
  // "Funds secured" because funds aren't secured until an ops/compliance
  // reviewer confirms the transfer against the bank statement (no
  // back-office UI for that yet - see confirm_bank_transfer on the
  // backend). Claiming otherwise here would be lying about payment state.
  | "transfer_submitted"
  // Contract e-signature - purely local UI, no backend field backs it.
  | "contract"
  // Real status only: shows the actual order once ops has confirmed the
  // transfer (rfq.order exists), otherwise an honest "still pending"
  // variant of the same screen - never a fabricated "order confirmed".
  | "order_confirmed";

// Steps that show the 4-item progress bar at the top of the modal.
const STEPS_BY_FLOW_STEP: Partial<Record<FlowStep, number>> = {
  purchase_order: 1,
  review_purchase_order: 1,
  secure_payment: 2,
  contract: 3,
  order_confirmed: 3,
};

const ESCROW_FEE = 30000;

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-[#E9ECF2] rounded-lg px-4 py-3">
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value ?? "—"}</div>
    </div>
  );
}

function PartyCard({ label, name, location, isYou }: { label: string; name: string; location: string; isYou?: boolean }) {
  return (
    <div className="border border-[#E9ECF2] rounded-xl p-4">
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <Avatar
          shape="square"
          className={`!rounded-lg ${isYou ? "!bg-green-100 !text-green-700" : "!bg-purple-100 !text-purple-600"}`}
          icon={!name && <UserOutlined />}
        >
          {name ? name[0] : undefined}
        </Avatar>
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-1 text-sm">
            {name} <CheckCircleFilled className="text-blue-500 text-xs" />
          </div>
          <div className="text-xs text-gray-500">{location}</div>
        </div>
      </div>
    </div>
  );
}

function AcceptOfferFlowModal({
  offer,
  mineral,
  step,
  buyerName,
  buyerLocation,
  bankTransfer,
  fundingEscrow,
  orderConfirmed,
  orderCode,
  onClose,
  onAdvance,
  onViewOrder,
}: {
  offer: MockOffer;
  mineral: string;
  step: FlowStep;
  buyerName: string;
  buyerLocation: string;
  bankTransfer: BankTransferInstructions | null;
  fundingEscrow: boolean;
  // Whether ops has actually confirmed the transfer (rfq.order exists) by
  // the time the buyer reaches the final step - determines whether that
  // screen can honestly say "confirmed" or must say "still pending".
  orderConfirmed: boolean;
  orderCode: string | null;
  onClose: () => void;
  onAdvance: (next: FlowStep) => void | Promise<void>;
  onViewOrder: () => void;
}) {
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signatureTouched, setSignatureTouched] = useState(false);
  const [agreeTouched, setAgreeTouched] = useState(false);

  const [modalOpenedAt] = useState(() => Date.now());
  const deliveryDate = new Date(modalOpenedAt + offer.deliveryDays * 86400000).toLocaleDateString();

  const stepsIndex = STEPS_BY_FLOW_STEP[step];
  const hasSteps = stepsIndex !== undefined;
  // Every step that shows the 4-item Steps bar needs enough room for full
  // labels ("Offer accepted", "Purchase order", ...) on one line, or antd
  // wraps them mid-word and the bar collides with the modal's close
  // button. 640 was too narrow for that - matches the width the other
  // stepped screens (purchase_order/review_purchase_order/order_confirmed)
  // already used.
  const modalWidth = hasSteps ? 760 : 600;
  const isBareCard = step === "bank_transfer" || step === "transfer_submitted";

  return (
    <Modal
      open={step !== "closed"}
      onCancel={onClose}
      footer={null}
      width={modalWidth}
      // Below the modal's own width, let it shrink to the viewport instead
      // of overflowing / forcing horizontal scroll on small screens.
      style={{ maxWidth: "calc(100vw - 32px)" }}
      // Always vertically centered - the stepped screens (purchase order,
      // review, contract...) previously used antd's default top-anchored
      // position, which left a large empty gap below on most viewports.
      // No internal scroll container: every step's content is short enough
      // to fit without one, and a capped-height inner scrollbar looked
      // worse than just letting the modal size to its content.
      styles={{ body: { paddingBottom: 4 } }}
      destroyOnHidden
      closable={!isBareCard}
      maskClosable={!isBareCard}
      centered
    >
      {stepsIndex !== undefined && (
        <Steps
          size="small"
          current={stepsIndex}
          className="!mb-6 !pr-8"
          items={
            step === "order_confirmed"
              ? [
                  { title: "Offer accepted", status: "finish" },
                  { title: "Purchase order", status: "finish" },
                  { title: "Secure payment", status: "finish" },
                  { title: "Contract signed", status: orderConfirmed ? "finish" : "wait" },
                ]
              : [
                  { title: "Offer accepted" },
                  { title: "Purchase order" },
                  { title: "Secure payment" },
                  { title: "Contract" },
                ]
          }
        />
      )}

      {step === "accept" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Accept this offer?</h2>
          <p className="text-sm text-gray-500 mb-4">
            You&apos;re about to accept the offer from {offer.miner} for {offer.quantity} DMT of {mineral}
          </p>
          <div className="border border-[#E9ECF2] rounded-xl p-3 flex items-center gap-3 mb-4">
            <Avatar shape="square" className="!bg-purple-100 !text-purple-600 !rounded-lg">
              {offer.miner[0]}
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 flex items-center gap-1">
                {offer.miner} <CheckCircleFilled className="text-blue-500 text-xs" />
              </div>
              <div className="text-xs text-gray-500">{offer.location}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <InfoBox label="Commodity" value={mineral} />
            <InfoBox label="Price / quantity" value={formatNaira(offer.pricePerUnit)} />
            <InfoBox label="Delivery days" value={`${offer.deliveryDays} days`} />
            <InfoBox label="Quantity" value={`${offer.quantity} DMT`} />
            <InfoBox label="Origin" value={offer.origin} />
            <InfoBox label="Total amount" value={formatNaira(offer.totalValue)} />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <PartyCard label="Buyer (you)" name={buyerName} location={buyerLocation} isYou />
            <PartyCard label="Miner" name={offer.miner} location={offer.location} />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment structure</div>
            <div className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-gray-500">Method</span>
              <Tag icon={<LockOutlined />} className="!bg-gray-900 !text-white !border-0">
                BELDIUM ESCROW
              </Tag>
            </div>
            <div className="flex items-center justify-between py-1.5 pt-2 border-t border-gray-200 mt-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total amount</span>
              <span className="font-bold text-gray-900">{formatNaira(offer.totalValue)}</span>
            </div>
          </div>

          <div className="text-sm font-semibold text-gray-900 mb-2">Order details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <InfoBox label="Commodity" value={mineral} />
            <InfoBox label="Quantity" value={`${offer.quantity} DMT`} />
            <InfoBox label="Price per DMT" value={formatNaira(offer.pricePerUnit)} />
            <InfoBox label="Total amount" value={formatNaira(offer.totalValue)} />
          </div>

          <div className="text-sm font-semibold text-gray-900 mb-2">Logistics</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <InfoBox label="Origin" value={offer.origin} />
            <InfoBox label="Destination" value={offer.destination} />
            <InfoBox label="Delivery days" value={`${offer.deliveryDays} days`} />
            <InfoBox label="Transport mode" value={offer.transportMode} />
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => onAdvance("accept")}>Back</Button>
            <Button type="primary" onClick={() => onAdvance("review_purchase_order")}>
              Proceed to contract
            </Button>
          </div>
        </>
      )}

      {step === "review_purchase_order" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Review purchase order</h2>
          <p className="text-sm text-gray-500 mb-4">Review the order details carefully before proceeding to contract</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order details</div>
              <Row label="Miner" value={offer.miner} />
              <Row label="Commodity" value={mineral} />
              <Row label="Quantity" value={`${offer.quantity} MT`} />
              <Row label="Delivery date" value={deliveryDate} />
              <Row label="Transport mode" value={offer.transportMode} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Financial summary
              </div>
              <Row label="Unit price" value={`${formatNaira(offer.pricePerUnit)} / MT`} />
              <Row label="Subtotal" value={formatNaira(offer.totalValue)} />
              <Row label="Logistics fees" value={formatNaira(offer.totalValue)} />
              <Row label="Total" value={<span className="font-bold">{formatNaira(offer.totalValue * 2)}</span>} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => onAdvance("purchase_order")}>Back</Button>
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
            Secure your funds in Beldium Escrow. Your payment will be held securely and released to the miner
            according to transaction type
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Amount to secure</span>
                <span className="text-lg font-bold text-gray-900">{formatNaira(offer.totalValue)}</span>
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment method</div>
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
                <BankOutlined />
              </div>
            </div>
            <div className="border border-[#E9ECF2] rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Product details
              </div>
              <Row label="Commodity" value={mineral} />
              <Row label="Unit price" value={`${formatNaira(offer.pricePerUnit)} / MT`} />
              <Row label="Quantity" value={`${offer.quantity} MT`} />
              <Row label="Escrow fees" value={formatNaira(ESCROW_FEE)} />
              <Row label="Total value" value={formatNaira(offer.totalValue)} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => onAdvance("review_purchase_order")}>Back</Button>
            <Button type="primary" loading={fundingEscrow} onClick={() => onAdvance("bank_transfer")}>
              Get bank transfer details
            </Button>
          </div>
        </>
      )}

      {step === "bank_transfer" && (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl mb-4">
            <BankOutlined />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Transfer to secure your order</h2>
          <p className="text-sm text-gray-500 mb-5 max-w-sm">
            Bank transfer is the only funding method available right now. Transfer the exact amount below, using the
            reference shown, then confirm you&apos;ve sent it.
          </p>
          {bankTransfer ? (
            <div className="w-full text-left bg-gray-50 rounded-xl p-4 mb-5">
              <Row label="Bank" value={bankTransfer.bank_name} />
              <Row label="Account name" value={bankTransfer.account_name} />
              <Row label="Account number" value={bankTransfer.account_number} />
              <Row label="Amount" value={formatNaira(Number(bankTransfer.amount))} />
              <Row label="Reference" value={<span className="font-bold">{bankTransfer.reference}</span>} />
            </div>
          ) : (
            <p className="text-sm text-red-500 mb-5">Couldn&apos;t load transfer details. Please try again.</p>
          )}
          <Button type="primary" block disabled={!bankTransfer} onClick={() => onAdvance("transfer_submitted")}>
            I&apos;ve sent the transfer
          </Button>
        </div>
      )}

      {step === "transfer_submitted" && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
            <CheckCircleFilled />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Transfer submitted</h2>
          <p className="text-sm text-gray-500 mb-5 max-w-sm">
            We&apos;ll confirm your transfer against the reference {bankTransfer?.reference ?? ""} and secure your
            funds once it clears - usually within a few hours. You can go ahead and sign the contract now.
          </p>
          <Button type="primary" block onClick={() => onAdvance("contract")}>
            Proceed to sign contract
          </Button>
          <p className="text-xs text-gray-400 flex items-center gap-1 !mt-4">
            <SafetyCertificateOutlined /> Your funds will be protected and held securely in escrow once confirmed.
          </p>
        </div>
      )}

      {step === "contract" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Accept &amp; sign contract</h2>
          <p className="text-sm text-gray-500 mb-4">
            By signing, you confirm that you agree to the terms of this transaction
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 mb-4">
            <Row label="Reference" value={bankTransfer?.reference ?? "—"} />
            <Row label="Miner" value={offer.miner} />
            <Row label="Total value" value={formatNaira(offer.totalValue)} />
          </div>
          <div className="text-xs text-gray-500 uppercase mb-1">Signature</div>
          <p className="text-xs text-gray-400 mb-2">Type full-name as electric signature</p>
          <input
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            onBlur={() => setSignatureTouched(true)}
            placeholder={buyerName || "Enter name"}
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
            <Button onClick={() => onAdvance("transfer_submitted")}>Back</Button>
            <Button
              type="primary"
              onClick={() => {
                setSignatureTouched(true);
                setAgreeTouched(true);
                if (signature && agreed) onAdvance("order_confirmed");
              }}
            >
              Save &amp; sign contract
            </Button>
          </div>
        </>
      )}

      {step === "order_confirmed" && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {orderConfirmed ? "Order confirmed" : "Contract signed - payment still pending"}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {orderConfirmed
              ? "Your order has been created successfully. You can track its progress from your orders page"
              : "Your contract is signed. Once our team confirms your bank transfer, your order will be created automatically - check back here or refresh this RFQ."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 mb-4">
            <Row label="Reference" value={orderCode ?? bankTransfer?.reference ?? "—"} />
            <Row label="Miner" value={offer.miner} />
            <Row label="Total value" value={formatNaira(offer.totalValue)} />
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-5">
            <span className="text-sm text-gray-600">Current status</span>
            <Tag
              icon={<LockOutlined />}
              className={
                orderConfirmed
                  ? "!bg-white !text-gray-900 !border !border-[#E9ECF2]"
                  : "!bg-amber-50 !text-amber-700 !border-0"
              }
            >
              {orderConfirmed ? "Escrow secured" : "Awaiting transfer confirmation"}
            </Tag>
          </div>

          <div className="text-sm font-semibold text-gray-900 mb-3">Order roadmap</div>
          <div className="flex flex-col mb-6">
            {[
              { label: "Order confirmed", status: orderConfirmed ? "Completed" : "Pending", done: orderConfirmed },
              { label: "Dispatch", status: "", done: false },
              { label: "Delivery", status: "", done: false },
              { label: "Funds release", status: "", done: false },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      item.done ? "bg-[#101E3D] text-white" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <CheckCircleFilled />
                  </span>
                  {i < arr.length - 1 && <span className="w-px flex-1 bg-gray-200 my-1" />}
                </div>
                <div className={`pb-4 ${item.done ? "" : "text-gray-400"}`}>
                  <div className={`text-sm font-medium ${item.done ? "text-gray-900" : ""}`}>{item.label}</div>
                  {item.status && <div className="text-xs text-gray-400">{item.status}</div>}
                </div>
              </div>
            ))}
          </div>

          {orderConfirmed ? (
            <Button type="primary" block onClick={onViewOrder}>
              View order
            </Button>
          ) : (
            <Button block onClick={onClose}>
              Done
            </Button>
          )}
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useMarketplaceAuth();
  const { data: rfq, isLoading, refetch: refetchRfq, isFetching: isFetchingRfq } = useQuery({
    queryKey: ["marketplace", "rfq-detail", id],
    queryFn: () => getRfqDetail(id),
  });
  const { data: quotesData, refetch: refetchQuotes, isFetching: isFetchingQuotes } = useQuery({
    queryKey: ["marketplace", "rfq-quotes", id],
    queryFn: () => getRfqQuotes(id),
    enabled: !!rfq,
    refetchInterval: 15000, // miners can submit a quote at any time - poll so the buyer sees new ones without reloading
  });
  const isRefreshing = isFetchingRfq || isFetchingQuotes;

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closedOverride, setClosedOverride] = useState(false);
  const [flowOffer, setFlowOffer] = useState<MockOffer | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>("closed");
  const [bankTransfer, setBankTransfer] = useState<BankTransferInstructions | null>(null);
  const [fundingEscrow, setFundingEscrow] = useState(false);
  const [decidingQuoteId, setDecidingQuoteId] = useState<string | null>(null);

  const buyerName = user?.full_name || user?.company_name || "You";
  const buyerLocation = rfq?.destination || "—";
  const destination = rfq?.destination ?? "—";

  const quotes = quotesData?.results ?? [];
  const pendingQuotes = quotes.filter((q) => q.status === "quoted");
  const acceptedQuote = quotes.find((q) => q.status === "accepted");
  const offers = pendingQuotes.map((q) => quoteToOffer(q, destination));
  const acceptedOffer = acceptedQuote ? quoteToOffer(acceptedQuote, destination) : null;

  const status: MockRfqStatus = closedOverride
    ? "closed"
    : acceptedOffer
      ? "accepted"
      : pendingQuotes.length > 0
        ? "under_review"
        : rfq?.status === "no_match"
          ? "no_match"
          : "open";

  const handleDeclineQuote = async (quote: RfqQuote) => {
    try {
      setDecidingQuoteId(quote.id);
      await declineRfqQuote(quote.id);
      await queryClient.invalidateQueries({ queryKey: ["marketplace", "rfq-quotes", id] });
      showToast("Quote declined", "success");
    } catch {
      showToast("Couldn't decline this quote. Please try again.", "error");
    } finally {
      setDecidingQuoteId(null);
    }
  };

  const columns: ColumnsType<MockOffer> = [
    { title: "Commodity", key: "mineral", render: () => rfq?.mineral_type },
    { title: "Miner", dataIndex: "miner", key: "miner" },
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
      render: (_, record) => {
        const quote = quotes.find((q) => q.id === record.id);
        return (
          <div className="flex items-center gap-2">
            <Button
              size="small"
              shape="round"
              danger
              loading={decidingQuoteId === record.id}
              disabled={status !== "under_review" || !quote}
              onClick={() => quote && handleDeclineQuote(quote)}
            >
              Decline
            </Button>
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
          </div>
        );
      },
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
                <Button
                  icon={<ReloadOutlined spin={isRefreshing} />}
                  onClick={() => {
                    refetchRfq();
                    refetchQuotes();
                  }}
                  className="!rounded-full"
                  aria-label="Refresh"
                />
                {status === "accepted" && rfq.order ? (
                  <Button type="primary" onClick={() => router.push(`/marketplace/orders/${rfq.order!.id}`)}>
                    View order
                  </Button>
                ) : status === "accepted" && acceptedOffer ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      // The buyer can land here already "accepted" without
                      // having walked the accept-offer modal (e.g. came
                      // back later) - jump straight to the payment step,
                      // skipping the re-confirmation screen.
                      setFlowOffer(acceptedOffer);
                      setBankTransfer(null);
                      setFlowStep("secure_payment");
                    }}
                  >
                    Proceed to payment
                  </Button>
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
            <p className="text-xs text-gray-400 mb-6">
              Last updated {new Date(rfq.updated_at).toLocaleString()}
            </p>

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
                        {acceptedOffer.miner[0]}
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          {acceptedOffer.miner} <CheckCircleFilled className="text-blue-500 text-xs" />
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
                    status === "no_match" ? (
                      <div>
                        <p className="text-gray-900 font-medium mb-1">No miners available for this mineral</p>
                        <p className="text-sm text-gray-500">
                          No verified miner currently supplies {rfq?.mineral_type} - your request wasn&apos;t sent to
                          anyone. Try a different mineral or check back later.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-900 font-medium mb-1">You have no offers yet</p>
                        <p className="text-sm text-gray-500">
                          Your request is live and miners can submit offers based on your requirement
                        </p>
                      </div>
                    )
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
                  scroll={{ x: "max-content" }}
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
          buyerName={buyerName}
          buyerLocation={buyerLocation}
          bankTransfer={bankTransfer}
          fundingEscrow={fundingEscrow}
          orderConfirmed={!!rfq?.order}
          orderCode={rfq?.order?.order_code ?? null}
          onClose={() => {
            setFlowStep("closed");
            setFlowOffer(null);
          }}
          onAdvance={async (next) => {
            if (next === "purchase_order" && flowStep === "accept") {
              const quote = quotes.find((q) => q.id === flowOffer.id);
              if (quote) {
                try {
                  setDecidingQuoteId(quote.id);
                  await acceptRfqQuote(quote.id);
                  await queryClient.invalidateQueries({ queryKey: ["marketplace", "rfq-quotes", id] });
                } catch {
                  showToast("Couldn't accept this quote. Please try again.", "error");
                  setDecidingQuoteId(null);
                  return;
                }
                setDecidingQuoteId(null);
              }
            }
            if (next === "bank_transfer" && rfq) {
              try {
                setFundingEscrow(true);
                const result = await fundEscrow(rfq.id);
                setBankTransfer(result.bank_transfer);
              } catch {
                showToast("Couldn't start escrow funding. Please try again.", "error");
                setFundingEscrow(false);
                return;
              }
              setFundingEscrow(false);
            }
            if (next === "transfer_submitted" || next === "order_confirmed") {
              // Ops may have already confirmed by the time the buyer signs
              // the contract - re-check before deciding what the final
              // screen can honestly claim.
              await queryClient.invalidateQueries({ queryKey: ["marketplace", "rfq-detail", id] });
            }
            setFlowStep(next);
          }}
          onViewOrder={() => {
            if (rfq?.order) router.push(`/marketplace/orders/${rfq.order.id}`);
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
