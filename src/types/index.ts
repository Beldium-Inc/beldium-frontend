export type DateValuePiece = Date | string;

export interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  mobileLeaderBoardOpen:boolean;
  showOtpModal:boolean;
  alertModalOpen:boolean;
  confirmModalOpen:boolean;
  showTransactionPinModal:boolean;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openMobileLeaderBoard: () => void;
  closeMobileLeaderBoard: () => void;
  openAlertModal: () => void;
  closeAlertModal: () => void;
  openOtpModal: () => void;
  closeOtpModal: () => void;
  openConfirmModal: () => void;
  closeConfirmModal: () => void;
  openTransactionPinModal: () => void,
  closeTransactionPinModal: () => void,
}

export type TransactionType = "deposit" | "withdraw";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: number;
  customerFullname: string;
  type: TransactionType;
  date: string; // ISO date string: YYYY-MM-DD
  amount: number; // stored as raw number
  status: TransactionStatus;
}

export interface FaqType {
  question:string;
  category:string;
  answer:string;
}
