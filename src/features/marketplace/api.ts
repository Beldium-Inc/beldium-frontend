import { authApi } from "@/src/lib/axiosInstance";

// Field names below are verified against MinerProfileViewSet / MinerProfileSerializer
// (api-beldium-backend/miners/views.py, miners/serializers.py). Do not add fields that
// aren't on the serializer without re-checking the backend first.

export type MinerProfileListItem = {
  id: string;
  user: string;
  user_email: string;
  country: string;
  state_of_operation: string;
  local_government_area: string;
  business_role: string;
  mineral_type: string;
  mining_method: string | null;
  operational_status: string | null;
  mining_title_status: string | null;
  license_number: string | null;
  license_issue_date: string | null;
  estimated_monthly_output: string | null;
  miner_code: string;
  miner_number: string | null;
  created_at: string;
  updated_at: string;
};

export type MinerProfileListResponse = {
  status: string;
  message: string | null;
  data: {
    next: string | null;
    previous: string | null;
    count: number;
    total_pages: number;
    page_number: number;
    per_page: number;
    from: number;
    to: number;
    results: MinerProfileListItem[];
  };
};

export type MinerProfileListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  country?: string;
  state_of_operation?: string;
  mining_method?: string;
  mineral_type?: string;
  ordering?: string;
};

export async function getMinerProfiles(params: MinerProfileListParams) {
  const { data } = await authApi.get<MinerProfileListResponse>("/miner-profiles/", {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      search: params.search || undefined,
      country: params.country || undefined,
      state_of_operation: params.state_of_operation || undefined,
      mining_method: params.mining_method || undefined,
      mineral_type: params.mineral_type || undefined,
      ordering: params.ordering || undefined,
    },
  });
  return data;
}
