import { create } from "zustand";

interface OnboardingState {
  step: number;
  totalSteps:number;
  data: {
    name: string;
    email: string;
    preferences: string[];
    role?: "miner" | "partner";
  };
  setStep: (step: number) => void;
  setData: (newData: Partial<OnboardingState["data"]>) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  totalSteps: 4,
  data: { name: "", email: "", preferences: [], role: undefined },
  setStep: (step) => set({ step }),
  setData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
}));
