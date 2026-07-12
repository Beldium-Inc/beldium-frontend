"use client";

export function UploadedFilePreview({
  fileName,
  fileSizeKb,
  onRemove,
}: {
  fileName: string;
  fileSizeKb: number;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 mt-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          PDF
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{fileName}</div>
          <div className="text-xs text-gray-400">
            {fileSizeKb} KB of {fileSizeKb} KB · Completed
          </div>
        </div>
      </div>
      <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 flex-shrink-0" aria-label="Remove file">
        🗑
      </button>
    </div>
  );
}
