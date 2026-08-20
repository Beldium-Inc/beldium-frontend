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
