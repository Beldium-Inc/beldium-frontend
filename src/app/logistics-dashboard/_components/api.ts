import { authApi } from "@/src/lib/axiosInstance";
import type { AssignmentStatus, Rfq, RfqAssignment, ShipmentStatus, TransactionRecord } from "./types";

function getAccessToken() {
  const token =
    typeof window !== "undefined" ? window.sessionStorage.getItem("accessToken") : null;

  if (!token) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  return token;
}

function authHeaders() {
  return { Authorization: `Bearer ${getAccessToken()}` };
}

// RFQs scoped server-side to RFQs this logistics user has an assignment on.
// Each RFQ includes nested `assignments` and `transaction`, which is enough
// to derive opportunities, assigned jobs, and wallet data without extra calls.
export async function getLogisticsRfqs() {
  const { data } = await authApi.get<Rfq[]>("/rfqs/", {
    headers: authHeaders(),
  });
  return data;
}

// RFQAssignment records, already filtered server-side to provider=current user.
export async function getRfqAssignments() {
  const { data } = await authApi.get<RfqAssignment[]>("/rfq-assignments/", {
    headers: authHeaders(),
  });
  return data;
}

export async function updateRfqAssignmentStatus({
  assignmentId,
  status,
}: {
  assignmentId: string;
  status: AssignmentStatus;
}) {
  const { data } = await authApi.patch<RfqAssignment>(
    `/rfq-assignments/${assignmentId}/`,
    { status },
    { headers: authHeaders() },
  );
  return data;
}

// TransactionRecords, filtered server-side to RFQs where this user has an
// accepted or in-progress logistics assignment.
export async function getRfqTransactions() {
  const { data } = await authApi.get<TransactionRecord[]>("/rfq-transactions/", {
    headers: authHeaders(),
  });
  return data;
}

export async function updateShipmentStatus({
  transactionId,
  shipment_status,
}: {
  transactionId: string;
  shipment_status: ShipmentStatus;
}) {
  const { data } = await authApi.patch<TransactionRecord>(
    `/rfq-transactions/${transactionId}/`,
    { shipment_status },
    { headers: authHeaders() },
  );
  return data;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      const message = record.message ?? record.detail ?? record.error;
      if (typeof message === "string") return message;
      const firstKey = Object.keys(record)[0];
      if (firstKey) {
        const value = record[firstKey];
        if (Array.isArray(value) && typeof value[0] === "string") return value[0];
        if (typeof value === "string") return value;
      }
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
