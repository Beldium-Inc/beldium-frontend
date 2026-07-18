import { useCallback, useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { DownloadOutlined, FileDoneOutlined, PrinterOutlined } from "@ant-design/icons";
import { downloadInvoice } from '../../dashboard/api';

export interface ArchiveActionsProps {
  orderId: string;
  orderCode: string;
  className?: string;
}

type ArchiveActionState = {
  isDownloading: boolean;
  error: string | null;
};

export default function ArchiveActions({
  orderId,
  orderCode,
  className = ''
}: ArchiveActionsProps) {
  const [state, setState] = useState<ArchiveActionState>({
    isDownloading: false,
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

  // Printing the current page is a real, local browser action — no backend
  // needed, so this one stays live (no fake loading/success theater).
  const handlePrintSummary = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={`bg-white rounded-3xl border border-[#E8EDF5] p-5 md:p-6 shadow-[0_18px_42px_-22px_rgba(15,23,42,0.34)] ${className}`} data-order-id={orderId}>
      <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.01em] text-[#0F172A] mb-5">Archive Actions</h2>
      
      <div className="space-y-3.5 flex flex-col mt-9 gap-5">
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
        
        <Tooltip title="Payment receipts aren't wired to a backend endpoint yet">
          <Button
            block
            disabled
            className="h-[52px] md:h-[56px] rounded-2xl border !border-[#CFD8E8] text-[#102A5C] hover:!border-[#9FB3D6] hover:!text-[#0B2458] active:!border-[#8EA4CA] flex items-center justify-center gap-3 !bg-white hover:!bg-[#F7FAFF] !transition-all !duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)]"
            icon={<FileDoneOutlined className="text-[17px]" />}
          >
            <span className="font-semibold text-[15px] md:text-base tracking-[0.01em]">Payment Receipt</span>
          </Button>
        </Tooltip>

        <Button
          block
          onClick={handlePrintSummary}
          className="h-[52px] md:h-[56px] rounded-2xl border !border-[#CFD8E8] text-[#102A5C] hover:!border-[#9FB3D6] hover:!text-[#0B2458] active:!border-[#8EA4CA] flex items-center justify-center gap-3 !bg-white hover:!bg-[#F7FAFF] !transition-all !duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)]"
          icon={<PrinterOutlined className="text-[17px]" />}
        >
          <span className="font-semibold text-[15px] md:text-base tracking-[0.01em]">Print Summary</span>
        </Button>
      </div>

      <div className="mt-7 pt-5 border-t border-[#EDF2F8] text-center">
        <p className="text-[13px] md:text-sm text-[#98A4B8] leading-[1.5]">
          This order is archived and cannot be edited. For disputes, contact{" "}
          <Tooltip title="Support contact isn't wired to a backend endpoint yet">
            <span className="text-[#98A4B8] font-semibold cursor-not-allowed">Support</span>
          </Tooltip>
        </p>
        {state.error && (
          <p className="mt-2 text-xs text-red-500">{state.error}</p>
        )}
      </div>
    </div>
  );
}
