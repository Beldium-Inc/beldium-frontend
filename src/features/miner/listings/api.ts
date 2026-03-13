import { authApi } from "@/src/lib/axiosInstance";

export type ListingCardsResponse = {
  status: string;
  data: {
    total_listings: number;
    active_listings: number;
    draft_listings: number;
  };
  message: string | null;
};

export type ListingRow = {
  listing_code: string;
  grade: string;
  quantity: number;
  mineral_form: string;
  mine_state: string;
  asking_price: string;
  status: string;
};

export type ListingsTableResponse = {
  status: string;
  data: {
    status: string;
    message: string;
    data: {
      next: string | null;
      previous: string | null;
      count: number;
      total_pages: number;
      page_number: number;
      per_page: number;
      from: number;
      to: number;
      results: ListingRow[];
    };
  };
  message: string | null;
};

export async function getListingCards() {
  const res = await authApi.get<ListingCardsResponse>("/listings/cards/");
  return res.data;
}

export async function getListingsTable(params: {
  page?: number;
  status?: string | null;
  state?: string | null;
  sort?: string | null;
  q?: string | null;
}) {
  const res = await authApi.get<ListingsTableResponse>("/listings/table/", {
    params: {
      page: params.page ?? 1,
      status: params.status ?? undefined,
      state: params.state ?? undefined,
      sort: params.sort ?? undefined,
      q: params.q ?? undefined,
    },
  });
  return res.data;
}

export type CreateListingPayload = {
  chemical_specs: Array<{ component_name: string; percentage: string }>;
  quantity_supply: {
    quantity_available: number;
    monthly_capacity: number;
    min_order_quantity: number;
    repeat_supply_capability: boolean;
  };
  location_delivery: {
    mine_state: string;
    mine_lga: string;
    delivery_basis: string;
    packaging_type: string;
    estimated_lead_time_days: number;
  };
  pricing: {
    pricing_method: string;
    asking_price_per_mt: string;
    currency: string;
  };
  commercial_terms: {
    payment_term: string;
    inspection_allowed: boolean;
    sample_available: boolean;
    additional_notes: string;
  };
  media: Array<{ file: string }>;
  assay_report: string;
  mineral_type: string;
  mineral_form: string;
  grade: string;
  verification_type: string;
  description: string;
};

export async function createListing(payload: CreateListingPayload) {
  const res = await authApi.post("/listings/", payload);
  return res.data;
}
