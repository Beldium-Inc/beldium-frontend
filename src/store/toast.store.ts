import { create } from "zustand";

type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
};

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, "id">) => void;
  hide: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) =>
    set((state) => {
      const id = Math.random().toString(36).slice(2);
      const next = { id, ...toast };
      return { toasts: [...state.toasts, next] };
    }),
  hide: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export function showToast(message: string, type: ToastType = "info", duration = 3500) {
  const { show } = useToastStore.getState();
  show({ message, type, duration });
}
