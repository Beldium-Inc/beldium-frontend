import { authApi, publicApi } from "@/src/lib/axiosInstance";

// Matches PublicListingSerializer (api-beldium-backend/miners/serializers.py)
// and PublicListingViewSet (api-beldium-backend/miners/views.py). Only
// ACTIVE listings are ever returned by this endpoint - it needs no auth.
export type ChemicalSpec = {
  id: string;
  component_name: string;
  percentage: string;
};

export type ListingSeller = {
  company_name: string;
  avatar: string | null;
  verification_status: string;
  is_verified: boolean;
};

export type PublicListing = {
  id: string;
  slug: string;
  listing_code: string;
  mineral_type: string;
  mineral_form: string;
  grade: string;
  description: string;
  chemical_specs: ChemicalSpec[];
  quantity_available: number;
  min_order_quantity: number;
  monthly_capacity: number;
  mine_state: string;
  asking_price_per_mt: string;
  currency: string;
  payment_term: string;
  delivery_basis: string;
  packaging_type: string;
  estimated_lead_time_days: number;
  assay_report: string | null;
  miner_company_name: string;
  is_verified: boolean;
  image: string | null;
  gallery_images: string[];
  seller: ListingSeller;
  is_saved: boolean;
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
//
// Uses authApi, not publicApi: `is_saved` is only computed server-side when
// the request carries a buyer's token (see get_serializer_context on
// PublicListingViewSet) - publicApi never attaches one, so this would
// always come back false for a signed-in buyer. The endpoint itself stays
// AllowAny, so an anonymous request through authApi still works the same
// as through publicApi, just without a token header.
export async function getPublicListingDetail(slug: string) {
  const { data } = await authApi.get<{ status: string; message: string | null; data: PublicListing }>(
    `/marketplace/listings/${slug}/`,
  );
  return data.data;
}

export async function saveListing(slug: string) {
  await authApi.post(`/marketplace/listings/${slug}/save/`);
}

export async function unsaveListing(slug: string) {
  await authApi.post(`/marketplace/listings/${slug}/unsave/`);
}

export async function getSavedListings() {
  const { data } = await authApi.get<PublicListingListResponse>("/marketplace/listings/saved/");
  return data.data;
}

/**
 * As of the latest PublicListingSerializer, most detail-page fields (description,
 * chemical_specs, min/monthly quantity, payment_term, delivery_basis,
 * packaging_type, estimated_lead_time_days, assay_report, gallery_images,
 * seller) are now real fields on PublicListing. These remain unserialized:
 *
 *  - purity                -> no model field yet (only `grade` exists)
 *  - coa_document_url      -> no COA doc type on Listing/ListingMedia
 *  - export_docs_url       -> no model field
 *  - quote_validity_days   -> no model field on CommercialTerm
 *  - origin_country        -> no model field (only mine_state exists)
 *  - loading_port          -> no model field
 *
 * These stay optional so the UI degrades gracefully (shows "—" or hides the
 * row) until a backend change adds them.
 */
export type PublicListingDetail = PublicListing & {
  purity?: string;
  coa_document_url?: string | null;
  export_docs_url?: string | null;
  quote_validity_days?: number;
  origin_country?: string;
  loading_port?: string;
};
