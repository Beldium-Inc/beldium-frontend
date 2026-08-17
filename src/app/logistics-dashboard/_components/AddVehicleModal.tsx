"use client";

import { useState } from "react";
import { CloseOutlined, FilePdfOutlined, CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";

export default function AddVehicleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [vehicleType, setVehicleType] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("available");

  if (!open) return null;

  const close = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#101e3d]/30 backdrop-blur-[2px]" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-[#edf1f7]">
          <div>
            <h2 className="font-semibold text-[#172554]">Add vehicle</h2>
            <p className="text-xs text-[#8b93a1] mt-0.5">Register a new vehicle to your fleet</p>
          </div>
          <button onClick={close} className="text-[#8b93a1] hover:text-[#4b5563]">
            <CloseOutlined className="text-[16px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-medium text-[#293041]">
                  Vehicles photo <span className="text-[#ef2f32]">*</span>
                </label>
                <div className="mt-2 border-2 border-dashed border-[#e4e9f2] rounded-xl flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <CloudUploadOutlined className="text-[20px] text-[#8b93a1]" />
                  <p className="text-sm text-[#293041]">Choose file or drag and drop it here</p>
                  <p className="text-xs text-[#8b93a1]">JPEG, PNG, and PDF formats, up to 20 MB.</p>
                  <button
                    type="button"
                    className="mt-1 text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
                  >
                    Browse files
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#293041] mb-3">
                  Vehicles information <span className="text-[#ef2f32]">*</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#6f7786]">Vehicle type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="mt-1 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d]"
                    >
                      <option value="">Select vehicle type</option>
                      <option>Truck</option>
                      <option>Flatbed Truck</option>
                      <option>Tipper</option>
                      <option>Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#6f7786]">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g Volvo"
                      className="mt-1 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6f7786]">Year</label>
                    <input
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="YYYY"
                      className="mt-1 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6f7786]">Model</label>
                    <input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g FH16"
                      className="mt-1 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6f7786]">Vehicle status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d]"
                    >
                      <option value="available">available</option>
                      <option value="assigned">assigned</option>
                      <option value="maintenance">maintenance</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-sm font-medium text-[#293041] mb-3">Vehicles Documents</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#6f7786]">
                    Vehicle insurance <span className="text-[#ef2f32]">*</span>
                  </label>
                  <div className="mt-1.5 border border-dashed border-[#dbe0ea] rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-sm text-[#8b93a1]">
                    <CloudUploadOutlined /> Click here to upload file
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6f7786]">
                    Vehicle registration <span className="text-[#ef2f32]">*</span>
                  </label>
                  <div className="mt-1.5 border border-dashed border-[#dbe0ea] rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-sm text-[#8b93a1]">
                    <CloudUploadOutlined /> Click here to upload file
                  </div>
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#edf1f7] px-3 py-2">
                    <FilePdfOutlined className="text-[#ef2f32]" />
                    <div className="flex-1">
                      <div className="text-sm text-[#293041]">Registration</div>
                      <div className="text-xs text-[#8b93a1]">120 KB of 120 KB · Completed</div>
                    </div>
                    <DeleteOutlined className="text-[#8b93a1]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6f7786]">
                    Roadworthiness <span className="text-[#ef2f32]">*</span>
                  </label>
                  <div className="mt-1.5 border border-dashed border-[#dbe0ea] rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-sm text-[#8b93a1]">
                    <CloudUploadOutlined /> Click here to upload file
                  </div>
                  <div className="mt-2 rounded-lg border border-[#edf1f7] px-3 py-2">
                    <div className="flex items-center gap-3">
                      <FilePdfOutlined className="text-[#ef2f32]" />
                      <div className="flex-1">
                        <div className="text-sm text-[#293041]">Roadworthiness</div>
                        <div className="text-xs text-[#8b93a1]">60 KB of 120 KB · Uploading</div>
                      </div>
                      <CloseOutlined className="text-[#8b93a1]" />
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-[#e5e8ef] overflow-hidden">
                      <div className="h-full w-1/2 bg-[#101e3d]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-[#edf1f7]">
          <button
            onClick={step === 1 ? close : () => setStep(1)}
            className="px-4 py-2 rounded-lg border border-[#dbe0ea] text-sm text-[#293041] hover:bg-[#f9fafc]"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={() => {
              if (step === 1) {
                setStep(2);
              } else {
                showToast("Fleet management isn't connected to the backend yet.", "info");
                close();
              }
            }}
            className={classNames(
              "px-4 py-2 rounded-lg text-sm font-medium",
              step === 1 && !vehicleType
                ? "bg-[#e5e8ef] text-[#9ca3af] cursor-not-allowed"
                : "bg-[#101e3d] !text-white hover:bg-[#182a52]",
            )}
            disabled={step === 1 && !vehicleType}
          >
            {step === 1 ? "Next" : "Add vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}
