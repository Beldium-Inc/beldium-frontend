"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getListingDetail, deleteListing, publishListing } from "@/src/features/miner/listings/api";
import { Button, Skeleton, Modal, Tag } from "antd";
import { CheckCircleFilled, CheckCircleOutlined, InfoCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";
import { DEFAULT_CURRENCY_SYMBOL } from "@/src/constants";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["listingDetail", id],
    queryFn: () => getListingDetail(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Failed to load listing</p>
        <Button onClick={() => router.push('/dashboard?view=listings')}>Back to Listings</Button>
      </div>
    );
  }

  const listing = data.data;
  const isDraft = listing.status === "draft";

  const formatCurrency = (amount: string | number) =>
    `${DEFAULT_CURRENCY_SYMBOL}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await publishListing(id);
      showToast("Listing published successfully", "success");
      setPublishModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["listingDetail", id] });
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "response" in err
          ? // @ts-expect-error runtime guard
            err.response?.data?.message
          : null;
      showToast(msg || "Failed to publish listing", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteListing(id);
      showToast("Listing deleted", "success");
      router.push('/dashboard?view=listings');
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "response" in err
          ? // @ts-expect-error runtime guard
            err.response?.data?.message
          : null;
      showToast(msg || "Failed to delete listing", "error");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Readiness checklist, derived from real listing fields
  const checklist = [
    { label: "Mineral type provided", done: Boolean(listing.mineral_type) },
    { label: `${listing.mineral_type || "Mineral"} grade valid`, done: Boolean(listing.grade) },
    { label: "Quantity specified", done: Boolean(listing.quantity_supply?.quantity_available) },
    { label: "Location defined", done: Boolean(listing.location_delivery?.mine_state) },
    { label: "Pricing method selected", done: Boolean(listing.pricing?.pricing_method) },
    { label: "Payment terms defined", done: Boolean(listing.commercial_terms?.payment_term) },
  ];
  const completedCount = checklist.filter((c) => c.done).length;
  const readyToPublish = completedCount === checklist.length;

  const suggestions: string[] = [];
  if (!listing.assay_report) suggestions.push("Adding an assay report increases buyer trust");
  if (!listing.media || listing.media.length === 0) suggestions.push("Include images to improve visibility");

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 flex items-center gap-1.5">
        <button onClick={() => router.push('/dashboard?view=listings')} className="hover:text-gray-600 transition-colors">
          Listing
        </button>
        <span>›</span>
        <span className="text-gray-500">#{listing.listing_code}</span>
      </div>

      {isDraft && (
        <div className="bg-blue-50 text-blue-700 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
          <EyeOutlined />
          This is a preview of how buyers will see your listing. Review all details carefully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {listing.mineral_type} {listing.mineral_form ? `- ${listing.grade}% ${listing.mineral_type === "Lithium" ? "Li2O" : ""}` : ""}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-sm text-gray-500">
              <span className="capitalize">Material Form: <span className="text-gray-900 font-medium capitalize">{listing.mineral_form}</span></span>
              <span>Location: <span className="text-gray-900 font-medium">{listing.location_delivery?.mine_state}, Nigeria</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {listing.assay_report && (
                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircleFilled /> Assay Report Uploaded</span>
              )}
              {listing.verification_type === "independent_lab" && (
                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircleFilled /> Verified by Independent Lab</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">Available Quantity</div>
              <div className="text-lg font-semibold">{listing.quantity_supply?.quantity_available?.toLocaleString()} MT</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">Monthly Capacity</div>
              <div className="text-lg font-semibold">{listing.quantity_supply?.monthly_capacity?.toLocaleString()} MT/month</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">MOQ</div>
              <div className="text-lg font-semibold">{listing.quantity_supply?.min_order_quantity?.toLocaleString()} MT</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-400 mb-1">Repeat Supply</div>
              <div className="text-lg font-semibold">{listing.quantity_supply?.repeat_supply_capability ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px]">●</span>
              <h2 className="text-base font-semibold text-gray-900">Chemical Composition</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase bg-gray-50">
                  <th className="py-2 px-3 font-medium">Compound</th>
                  <th className="py-2 px-3 font-medium text-right">Value (%)</th>
                </tr>
              </thead>
              <tbody>
                {(listing.chemical_specs || []).map((spec) => (
                  <tr key={spec.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 px-3 text-gray-700">{spec.component_name}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-gray-900">{spec.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px]">●</span>
              <h2 className="text-base font-semibold text-gray-900">Location &amp; Delivery</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-gray-400 mb-1">Delivery Basis</div>
                <div className="text-sm font-medium text-gray-900">{listing.location_delivery?.delivery_basis || "--"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Packaging</div>
                <div className="text-sm font-medium text-gray-900">{listing.location_delivery?.packaging_type || "--"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Lead Time</div>
                <div className="text-sm font-medium text-gray-900">{listing.location_delivery?.estimated_lead_time_days ?? "--"} days</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px]">●</span>
              <h2 className="text-base font-semibold text-gray-900">Pricing</h2>
            </div>
            {listing.pricing?.pricing_method === "fixed" ? (
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(listing.pricing.asking_price_per_mt)} / MT
              </div>
            ) : (
              <>
                <div className="text-lg font-semibold text-gray-900">Request for Quote</div>
                <p className="text-sm text-gray-500 mt-1">Submit request to receive pricing.</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-[10px]">●</span>
              <h2 className="text-base font-semibold text-gray-900">Commercial Terms</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-sm text-gray-500">Payment Terms:</span>
              {(listing.commercial_terms?.payment_term || "").split(",").filter(Boolean).map((t) => (
                <Tag key={t} className="rounded-md bg-gray-100 border-0 text-gray-700">{t.toUpperCase()}</Tag>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <CheckCircleOutlined className="text-green-500" />
                Inspection Allowed: {listing.commercial_terms?.inspection_allowed ? "Yes" : "No"}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleOutlined className="text-green-500" />
                Sample Available: {listing.commercial_terms?.sample_available ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px]">●</span>
              <h2 className="text-base font-semibold text-gray-900">Product Description</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{listing.description || "No description provided."}</p>
          </div>

          {listing.media && listing.media.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px]">●</span>
                <h2 className="text-base font-semibold text-gray-900">Product Images</h2>
              </div>
              <div className="flex gap-3 flex-wrap">
                {listing.media.map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={m.id} src={m.file} alt="Listing media" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {isDraft && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Listing Readiness</h3>
              <div className={`flex items-center gap-1.5 text-sm mb-3 ${readyToPublish ? "text-green-600" : "text-orange-500"}`}>
                <CheckCircleFilled />
                {readyToPublish ? "Ready for submission" : "Needs attention"}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Completion</span>
                <span>{completedCount}/{checklist.length}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full ${readyToPublish ? "bg-green-500" : "bg-orange-400"}`}
                  style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                />
              </div>
              <div className="space-y-2">
                <Button
                  type="primary"
                  block
                  disabled={!readyToPublish}
                  onClick={() => setPublishModalOpen(true)}
                >
                  Publish Listing
                </Button>
                <Button block onClick={() => router.push(`/dashboard?view=create_listing&edit=${id}`)}>
                  Edit Listing
                </Button>
                <Button block danger onClick={() => setDeleteModalOpen(true)}>
                  Delete Listing
                </Button>
              </div>
            </div>
          )}

          {!isDraft && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Actions</h3>
              <Button block onClick={() => router.push(`/dashboard?view=create_listing&edit=${id}`)}>
                Edit Listing
              </Button>
              <Button block danger onClick={() => setDeleteModalOpen(true)}>
                Delete Listing
              </Button>
            </div>
          )}

          {isDraft && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Checklist</h3>
              <div className="space-y-2">
                {checklist.map((c) => (
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    <CheckCircleFilled className={c.done ? "text-green-500" : "text-gray-300"} />
                    <span className={c.done ? "text-gray-700" : "text-gray-400"}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isDraft && suggestions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Smart Suggestions</h3>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <div key={s} className="flex items-start gap-2 text-xs text-indigo-600">
                    <InfoCircleOutlined className="mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Publish Listing"
        open={publishModalOpen}
        onCancel={() => setPublishModalOpen(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setPublishModalOpen(false)}>Cancel</Button>,
          <Button key="confirm" type="primary" loading={publishing} onClick={handlePublish}>Confirm &amp; Publish</Button>,
        ]}
      >
        <p className="text-sm text-gray-600">
          Are you ready to publish this listing? Once published, it will be submitted for review by our compliance team.
        </p>
      </Modal>

      <Modal
        title="Delete Listing"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>,
          <Button key="confirm" danger type="primary" loading={deleting} onClick={handleDelete}>Delete</Button>,
        ]}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this listing? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
