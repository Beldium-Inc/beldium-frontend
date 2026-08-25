import { UIState } from '@/src/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      mobileLeaderBoardOpen:false,
      alertModalOpen:false,
      showOtpModal:false,
      confirmModalOpen:false,
      showTransactionPinModal:false,
      toggleSidebar: () =>
      set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      openMobileLeaderBoard: () => set({ mobileLeaderBoardOpen: true }),
      closeMobileLeaderBoard: () => set({ mobileLeaderBoardOpen: false }),
      openAlertModal: () => set({ alertModalOpen: true }),
      closeAlertModal: () => set({ alertModalOpen: false }),
      openOtpModal: () => set({ showOtpModal: true }),
      closeOtpModal: () => set({ showOtpModal: false }),
      openConfirmModal: () => set({ confirmModalOpen: true }),
      closeConfirmModal: () => set({ confirmModalOpen: false }),
      openTransactionPinModal: () => set({ showTransactionPinModal: true }),
      closeTransactionPinModal: () => set({ showTransactionPinModal: false }),
    }),
    {
      name: 'beldium-ui-store',
      storage: createJSONStorage(() => localStorage),
      // Only the sidebar's collapsed/expanded state should survive a refresh -
      // transient UI (modals, drawers) must always start closed on load.
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
