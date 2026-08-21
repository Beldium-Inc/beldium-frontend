import { publicApi } from "@/src/lib/axiosInstance";

// Matches PublicListingSerializer (api-beldium-backend/miners/serializers.py)
// and PublicListingViewSet (api-beldium-backend/miners/views.py). Only
// ACTIVE listings are ever returned by this endpoint - it needs no auth.
export type PublicListing = {
  id: string;
  slug: string;
  listing_code: string;
  mineral_type: string;
  mineral_form: string;
  grade: string;
  quantity_available: number;
  mine_state: string;
  asking_price_per_mt: string;
  currency: string;
  miner_company_name: string;
  is_verified: boolean;
  image: string | null;
  created_at: string;
};

export type PublicListingListResponse = {
  status: string;
  message: string | null;
  data: {
    next: string | null;
    previous: string | null;
    count: number;
    total_pages: number;
    page_number: number;
    per_page: number;
    results: PublicListing[];
  };
};

export type MarketplaceStats = {
  total_active_listings: number;
  mineral_count: number;
  buyer_count: number;
  supplier_count: number;
  transaction_count: number;
};

export type MarketplaceCategory = {
  mineral_type: string;
  count: number;
};

export type PublicListingParams = {
  page?: number;
  page_size?: number;
  search?: string;
  mineral_type?: string;
  location_delivery__mine_state?: string;
  ordering?: string;
};

export async function getPublicListings(params: PublicListingParams = {}) {
  const { data } = await publicApi.get<PublicListingListResponse>("/marketplace/listings/", {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 8,
      search: params.search || undefined,
      mineral_type: params.mineral_type || undefined,
      location_delivery__mine_state: params.location_delivery__mine_state || undefined,
      ordering: params.ordering || undefined,
    },
  });
  return data;
}

export async function getMarketplaceStats() {
  const { data } = await publicApi.get<{ status: string; message: string | null; data: MarketplaceStats }>(
    "/marketplace/listings/stats/",
  );
  return data.data;
}

export async function getMarketplaceCategories() {
  const { data } = await publicApi.get<{ status: string; message: string | null; data: MarketplaceCategory[] }>(
    "/marketplace/listings/categories/",
  );
  return data.data;
}

// PublicListingViewSet already supports retrieve by slug (lookup_field="slug"),
// so this hits a real, working endpoint - it returns exactly PublicListing,
// nothing more. See PublicListingDetail below for the fields the detail page
// design needs that PublicListingSerializer does NOT currently expose.
export async function getPublicListingDetail(slug: string) {
  const { data } = await publicApi.get<{ status: string; message: string | null; data: PublicListing }>(
    `/marketplace/listings/${slug}/`,
  );
  return data.data;
}

/**
 * The listing detail page design (material specs, purity, seller card,
 * commercial terms, shipping/delivery, documents) needs several fields that
 * exist on the backend models already but are NOT on PublicListingSerializer
 * yet, so they can't be fetched today. Per instruction, the backend was not
 * touched for this pass - this type documents exactly what's missing so a
 * backend change can add them later without re-deriving the requirements:
 *
 *  - purity                     -> no model field yet (only `grade` exists)
 *  - min_order_quantity          -> QuantitySupply.min_order_quantity (model has it, not serialized)
 *  - monthly_capacity            -> QuantitySupply.monthly_capacity (model has it, not serialized)
 *  - description                 -> Listing.description (model has it, not serialized)
 *  - chemical_specs[]            -> ChemicalSpecification (model has it, not serialized)
 *  - assay_report_url            -> Listing.assay_report (model has it, not serialized)
 *  - coa_document_url            -> no model field (no COA doc type on Listing/ListingMedia)
 *  - export_docs_url             -> no model field
 *  - seller_name / seller_avatar -> MinerProfile/User (only miner_company_name is serialized)
 *  - seller_verified             -> MinerProfile verification status not serialized here
 *  - payment_term                -> CommercialTerm.payment_term (model has it, not serialized)
 *  - quote_validity_days         -> no model field on CommercialTerm
 *  - lead_time_days              -> LocationDelivery.estimated_lead_time_days (model has it, not serialized)
 *  - delivery_basis (Incoterms)  -> LocationDelivery.delivery_basis (model has it, not serialized)
 *  - packaging_type              -> LocationDelivery.packaging_type (model has it, not serialized)
 *  - origin_country              -> no model field (only mine_state exists)
 *  - loading_port                -> no model field
 *  - gallery images[]            -> ListingMedia (model supports many, serializer only exposes one via `image`)
 *
 * All fields below are optional so the UI degrades gracefully (shows "—" or
 * hides the row) against the current, unmodified API response.
 */
export type PublicListingDetail = PublicListing & {
  purity?: string;
  min_order_quantity?: number;
  monthly_capacity?: number;
  description?: string;
  chemical_specs?: { component_name: string; percentage: string }[];
  assay_report_url?: string | null;
  coa_document_url?: string | null;
  export_docs_url?: string | null;
  seller_name?: string;
  seller_avatar?: string | null;
  seller_verified?: boolean;
  payment_term?: string;
  quote_validity_days?: number;
  lead_time_days?: number;
  delivery_basis?: string;
  packaging_type?: string;
  origin_country?: string;
  loading_port?: string;
  gallery?: string[];
};
