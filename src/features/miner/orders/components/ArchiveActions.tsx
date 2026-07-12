import { useCallback, useState } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined, FileDoneOutlined, PrinterOutlined } from "@ant-design/icons";
import { downloadInvoice } from '../../dashboard/api';

export interface ArchiveActionsProps {
  orderId: string;
  orderCode: string;
  className?: string;
}

type ArchiveActionState = {
  isDownloading: boolean;
  isGeneratingReceipt: boolean;
  isPrinting: boolean;
  error: string | null;
};

export default function ArchiveActions({
  orderId,
  orderCode,
  className = ''
}: ArchiveActionsProps) {
  const [state, setState] = useState<ArchiveActionState>({
    isDownloading: false,
    isGeneratingReceipt: false,
    isPrinting: false,
    error: null,
  });

  const updateState = useCallback((patch: Partial<ArchiveActionState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleDownloadInvoice = useCallback(async () => {
    try {
      updateState({ isDownloading: true, error: null });
      const blob = await downloadInvoice(orderId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      message.success(`Invoice for ${orderCode} downloaded`);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Failed to download invoice';
      updateState({ error: errMessage });
      message.error('Failed to download invoice');
    } finally {
      updateState({ isDownloading: false });
    }
  }, [orderId, orderCode, updateState]);

  // "Payment Receipt" and "Print Summary" have no backing backend endpoint
  // (only GET /miner/dashboard/{id}/invoice/ exists) — these remain a
  // client-only preview until a real endpoint is added.
  const runFakeAction = useCallback(async (action: 'receipt' | 'print') => {
    const loadingMap = { receipt: 'Generating payment receipt...', print: 'Preparing print summary...' } as const;
    const successMap = { receipt: `Payment receipt for ${orderCode} is ready`, print: `Print view for ${orderCode} is ready` } as const;
    const statePatchMap = { receipt: { isGeneratingReceipt: true }, print: { isPrinting: true } } as const;
    const donePatchMap = { receipt: { isGeneratingReceipt: false }, print: { isPrinting: false } } as const;

    updateState({ ...statePatchMap[action], error: null });
    const hide = message.loading(loadingMap[action], 1);
    await new Promise((resolve) => setTimeout(resolve, 700));
    hide();
    message.success(successMap[action]);
    if (action === 'print') window.print();
    updateState(donePatchMap[action]);
  }, [orderCode, updateState]);

  const handleGenerateReceipt = useCallback(async () => {
    await runFakeAction('receipt');
  }, [runFakeAction]);

  const handlePrintSummary = useCallback(async () => {
    await runFakeAction('print');
  }, [runFakeAction]);

  return (
    <div className={`bg-white rounded-3xl border border-[#E8EDF5] p-5 md:p-6 shadow-[0_18px_42px_-22px_rgba(15,23,42,0.34)] ${className}`} data-order-id={orderId}>
      <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.01em] text-[#0F172A] mb-5">Archive Actions</h2>
      
      <div className="space-y-3.5">
        <Button
          block
          type="primary"
          loading={state.isDownloading}
          onClick={handleDownloadInvoice}
          className="h-[52px] md:h-[56px] bg-[#071A44] hover:!bg-[#0B2458] active:!bg-[#051233] rounded-2xl border-0 shadow-[0_12px_24px_-14px_rgba(7,26,68,0.65)] !transition-all !duration-200 hover:-translate-y-0.5"
          icon={<DownloadOutlined className="text-[17px]" />}
        >
          <span className="font-semibold text-[15px] md:text-base tracking-[0.01em]">Download Invoice (PDF)</span>
        </Button>
        
        <Button
          block
          loading={state.isGeneratingReceipt}
          onClick={handleGenerateReceipt}
          className="h-[52px] md:h-[56px] rounded-2xl border !border-[#CFD8E8] text-[#102A5C] hover:!border-[#9FB3D6] hover:!text-[#0B2458] active:!border-[#8EA4CA] flex items-center justify-center gap-3 !bg-white hover:!bg-[#F7FAFF] !transition-all !duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)]"
          icon={<FileDoneOutlined className="text-[17px]" />}
        >
          <span className="font-semibold text-[15px] md:text-base tracking-[0.01em]">Payment Receipt</span>
        </Button>
        
        <Button
          block
          loading={state.isPrinting}
          onClick={handlePrintSummary}
          className="h-[52px] md:h-[56px] rounded-2xl border !border-[#CFD8E8] text-[#102A5C] hover:!border-[#9FB3D6] hover:!text-[#0B2458] active:!border-[#8EA4CA] flex items-center justify-center gap-3 !bg-white hover:!bg-[#F7FAFF] !transition-all !duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)]"
          icon={<PrinterOutlined className="text-[17px]" />}
        >
          <span className="font-semibold text-[15px] md:text-base tracking-[0.01em]">Print Summary</span>
        </Button>
      </div>
      
      <div className="mt-7 pt-5 border-t border-[#EDF2F8] text-center">
        <p className="text-[13px] md:text-sm text-[#98A4B8] leading-[1.5]">
          This order is archived and cannot be edited. For disputes, contact <span className="text-[#1D6CFF] font-semibold cursor-pointer hover:underline">Support</span>
        </p>
        {state.error && (
          <p className="mt-2 text-xs text-red-500">{state.error}</p>
        )}
      </div>
    </div>
  );
}
