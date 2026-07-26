// Types for the logistics dashboard's real backend data, mirrored from the
// Django `rfq` app models (RFQ, RFQAssignment, TransactionRecord).
// See api-beldium-backend/rfq/models.py and rfq/serializers.py (read-only reference).

export type RfqStatus =
  | "draft"
  | "pending_routing"
  | "routed"
  | "in_progress"
  | "compliance_failed"
  | "funded"
  | "fulfilled"
  | "archived"
  | "initiated"
  | "no_match";

export type AssignmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed";

export type ProviderRole = "miner" | "compliance" | "logistics" | "processor" | "finance";

export type ShipmentStatus = "assigned" | "in_transit" | "delivered" | "cancelled";

export type FinalStatus = "initiated" | "in_progress" | "completed" | "cancelled";

export interface RfqAssignment {
  id: string;
  rfq: string;
  provider: string;
  provider_role: ProviderRole;
  status: AssignmentStatus;
  accepted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionRecord {
  id: string;
  rfq: string;
  buyer: string;
  miner: string;
  escrow_status: string;
  shipment_status: ShipmentStatus;
  final_status: FinalStatus;
  total_value: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rfq {
  id: string;
  buyer: string;
  mineral_type: string;
  grade_spec: string;
  impurity_limit: string | null;
  total_weight: string;
  pickup_location: string | null;
  delivery_schedule: string;
  delivery_deadline: string | null;
  pricing_structure: string;
  incoterm: string;
  destination: string;
  fleet_requirements: string | null;
  insurance_requirements: string | null;
  status: RfqStatus;
  routed_at: string | null;
  rfq_number: number | null;
  rfq_code: string;
  created_at: string;
  updated_at: string;
  services: unknown;
  assignments: RfqAssignment[];
  compliance: unknown;
  transaction: TransactionRecord | null;
}
