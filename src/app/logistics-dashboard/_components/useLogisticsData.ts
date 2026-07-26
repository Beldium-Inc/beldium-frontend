"use client";

import { useQuery } from "@tanstack/react-query";
import { getLogisticsRfqs, getRfqAssignments, getRfqTransactions } from "./api";

// Shared read hooks for the logistics dashboard. Every real (non-mock) view
// composes these three queries instead of refetching independently, since
// the backend already scopes all three endpoints to the logged-in
// logistics provider.
// retry: false because an unauthenticated session (no accessToken) will
// never succeed on retry, and we want the error state to surface quickly
// instead of leaving the UI in an ambiguous "still loading" state.
export function useLogisticsRfqs() {
  return useQuery({
    queryKey: ["logistics", "rfqs"],
    queryFn: getLogisticsRfqs,
    retry: false,
  });
}

export function useRfqAssignments() {
  return useQuery({
    queryKey: ["logistics", "rfq-assignments"],
    queryFn: getRfqAssignments,
    retry: false,
  });
}

export function useRfqTransactions() {
  return useQuery({
    queryKey: ["logistics", "rfq-transactions"],
    queryFn: getRfqTransactions,
    retry: false,
  });
}
