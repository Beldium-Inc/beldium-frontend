import { authApi } from "@/src/lib/axiosInstance";

export type MiningSite = {
  id: string;
  organisation: string;
  name: string;
  country: string | null;
  state_of_operation: string | null;
  local_government_area: string | null;
  latitude: string | null;
  longitude: string | null;
  mineral_type: string | null;
  mining_method: string | null;
  depth_range: string | null;
  status: string;
  operational_status: string | null;
  compliance_score: string | null;
  created_at: string;
  updated_at: string;
};

export type MineralSourceProfile = MiningSite & {
  ownership_records: unknown[];
  equipment: unknown[];
  production_records: unknown[];
  inventory_movements: unknown[];
  samples: unknown[];
  inspections: unknown[];
  safety_records: unknown[];
  non_conformities: unknown[];
};

export type MiningSiteListResponse = {
  status: string;
  message: string | null;
  data: {
    next: string | null;
    previous: string | null;
    count: number;
    results: MiningSite[];
  };
};

export const getMiningSites = async (): Promise<MiningSiteListResponse> => {
  const res = await authApi.get("/mining-sites/");
  return res.data;
};

export const getMiningSiteSourceProfile = async (
  siteId: string
): Promise<{ status: string; message: string | null; data: MineralSourceProfile }> => {
  const res = await authApi.get(`/mining-sites/${siteId}/source-profile/`);
  return res.data;
};

export type CreateMiningSitePayload = {
  organisation: string;
  name: string;
  country?: string;
  state_of_operation?: string;
  local_government_area?: string;
  latitude?: number;
  longitude?: number;
  mineral_type?: string;
  mining_method?: string;
  depth_range?: string;
};

export const createMiningSite = async (payload: CreateMiningSitePayload) => {
  const res = await authApi.post("/mining-sites/", payload);
  return res.data;
};

export const getMiningOrganisations = async () => {
  const res = await authApi.get("/mining-organisations/");
  return res.data;
};
