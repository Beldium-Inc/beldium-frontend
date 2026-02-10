import { create } from "zustand";

interface ComplianceOnboardingState {
  step: number;
  totalSteps: number;
  data: Record<string, unknown>;
  setStep: (step: number) => void;
  setData: (newData: Partial<ComplianceOnboardingState["data"]>) => void;
}

export const useComplianceOnboardStore = create<ComplianceOnboardingState>((set) => ({
  step: 1,
  totalSteps: 8,
  data: {},
  setStep: (step) => set({ step }),
  setData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
}));
