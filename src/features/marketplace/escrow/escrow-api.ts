import { authApi } from "@/src/lib/axiosInstance";

// TransactionRecordViewSet (rfq/views.py) already scopes its queryset to
// `buyer=user.buyer_profile` for a buyer - a real, working endpoint that
// simply had no buyer-facing page pointed at it yet.
export type EscrowRecord = {
  id: string;
  rfq: string;
  escrow_status: string;
  shipment_status: string;
  final_status: string;
  total_value: string | null;
  created_at: string;
  buyer: { id: string; company_name: string; email: string };
  miner: { id: string; company_name: string; email: string };
};

export type EscrowListResponse = {
  status: string;
  message: string | null;
  data: {
    count: number;
    results: EscrowRecord[];
  };
};

export async function getBuyerEscrowRecords() {
  const { data } = await authApi.get<EscrowListResponse>("/escrow-records/", {
    params: { page_size: 50 },
  });
  return data.data;
}
