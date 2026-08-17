"use client";

import {
  CarOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import type { FleetVehicle } from "./data";

function docPill(status: FleetVehicle["insurance"]) {
  switch (status) {
    case "Valid":
      return statusStyles.green;
    case "Expiring soon":
      return statusStyles.amber;
    case "Expired":
      return statusStyles.red;
  }
}

export default function VehicleDetailView({ vehicle, onBack }: { vehicle: FleetVehicle; onBack: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-[#8b93a1]">
        <button onClick={onBack} className="hover:text-[#293041]">
          Fleet management
        </button>
        <span>/</span>
        <span className="text-[#293041] font-medium">Vehicle details</span>
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#ecfaf0] text-[#1ea43b] text-[11px] font-medium px-2.5 py-1">
          <CheckCircleOutlined /> Verified Logistics Vehicle
        </span>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-[#172554]">{vehicle.vehicle}</h1>
        <p className="text-sm text-[#8b93a1] mt-1">Manage vehicle profile, documents, drivers, and maintenance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-[16px] bg-[#f4f6f9] flex items-center justify-center overflow-hidden">
                <CarOutlined className="text-[40px] text-[#c3c9d4]" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
              <h2 className="font-semibold text-[#172554] mb-3">Vehicle information</h2>
              <dl className="space-y-2.5 text-sm">
                {[
                  ["Reg NO", vehicle.registration],
                  ["Vehicle type", vehicle.type],
                  ["Make", vehicle.make],
                  ["Model", vehicle.model],
                  ["Year", vehicle.year],
                  ["Current status", vehicle.status],
                  ["Vehicle ID", vehicle.id],
                  ["Date added", vehicle.dateAdded],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-[#8b93a1]">{label}</dt>
                    <dd className="text-[#293041] font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
              <h2 className="font-semibold text-[#172554] mb-3">Current assignment</h2>
              {vehicle.currentAssignment ? (
                <>
                  <dl className="space-y-2.5 text-sm">
                    {[
                      ["Job ID", vehicle.currentAssignment.jobId],
                      ["Job", vehicle.currentAssignment.job],
                      ["Route", vehicle.currentAssignment.route],
                      ["Assigned date", vehicle.currentAssignment.assignedDate],
                      ["Job status", vehicle.currentAssignment.jobStatus],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between">
                        <dt className="text-[#8b93a1]">{label}</dt>
                        <dd className="text-[#293041] font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    type="button"
                    className="mt-4 w-full text-sm px-4 py-2 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
                  >
                    View job →
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#8b93a1]">No active assignment for this vehicle.</p>
              )}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e8ecf4] bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#edf1f7] px-5 py-4">
              <h2 className="font-semibold text-[#172554]">Vehicle documents</h2>
              <button
                type="button"
                onClick={() => showToast("Fleet management isn't connected to the backend yet.", "info")}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
              >
                <UploadOutlined /> Upload Document
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-[#8b93a1] uppercase tracking-wide">
                  <th className="font-medium px-5 py-2">Document</th>
                  <th className="font-medium px-5 py-2">Status</th>
                  <th className="font-medium px-5 py-2">Document number</th>
                  <th className="font-medium px-5 py-2">Expiry date</th>
                  <th className="font-medium px-5 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f7]">
                {[
                  { label: "Vehicle insurance", status: vehicle.insurance, number: vehicle.insuranceNumber, expiry: vehicle.insuranceExpiry },
                  { label: "Roadworthiness", status: vehicle.roadworthiness, number: vehicle.roadworthinessNumber, expiry: vehicle.roadworthinessExpiry },
                ].map((doc) => {
                  const pill = docPill(doc.status);
                  return (
                    <tr key={doc.label}>
                      <td className="px-5 py-3 flex items-center gap-2 text-[#293041]">
                        <FileTextOutlined className="text-[#ef2f32]" /> {doc.label}
                      </td>
                      <td className="px-5 py-3">
                        <span className={classNames("text-xs font-medium px-2.5 py-1 rounded-full", pill.container)}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#6f7786]">{doc.number}</td>
                      <td className="px-5 py-3 text-[#6f7786]">{doc.expiry}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 text-[#8b93a1]">
                          <EyeOutlined className="cursor-pointer hover:text-[#293041]" />
                          <DownloadOutlined className="cursor-pointer hover:text-[#293041]" />
                          <DeleteOutlined className="cursor-pointer hover:text-[#ef2f32]" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <h2 className="font-semibold text-[#172554] mb-3">Assigned driver</h2>
            {vehicle.driver ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#e9f0ff] flex items-center justify-center text-[#101e3d] font-semibold shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#172554]">{vehicle.driver.name}</div>
                    <span className="inline-flex items-center gap-1 text-xs text-[#1ea43b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1ea43b]" /> {vehicle.driver.status}
                    </span>
                  </div>
                  <button className="ml-auto text-xs text-[#101e3d] underline">View profile →</button>
                </div>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-[#8b93a1]">Phone</dt>
                    <dd className="text-[#293041]">{vehicle.driver.phone}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#8b93a1]">E-mail</dt>
                    <dd className="text-[#293041]">{vehicle.driver.email}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#8b93a1]">Date assigned</dt>
                    <dd className="text-[#293041]">{vehicle.driver.dateAssigned}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => showToast("Fleet management isn't connected to the backend yet.", "info")}
                  className="mt-4 w-full text-sm px-4 py-2 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
                >
                  Re-assign driver
                </button>
              </>
            ) : (
              <p className="text-sm text-[#8b93a1]">No driver assigned to this vehicle yet.</p>
            )}
          </div>

          <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <h2 className="font-semibold text-[#172554] mb-3">Latest maintenance</h2>
            {vehicle.maintenance ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#293041]">{vehicle.maintenance.title}</span>
                  <span className="text-xs text-[#8b93a1]">{vehicle.maintenance.date}</span>
                </div>
                <div className="text-xs text-[#8b93a1] mt-1">
                  {vehicle.maintenance.mileage} · {vehicle.maintenance.provider}
                </div>
                <button className="mt-3 text-xs text-[#101e3d] underline">View all →</button>
              </>
            ) : (
              <p className="text-sm text-[#8b93a1]">No maintenance records yet.</p>
            )}
          </div>

          <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <h2 className="font-semibold text-[#172554] mb-3">Vehicle history</h2>
            <div className="space-y-3">
              {vehicle.history.map((h) => (
                <div key={h.title + h.time} className="text-sm">
                  <div className="text-[#293041]">{h.title}</div>
                  <div className="text-xs text-[#8b93a1]">{h.time}</div>
                </div>
              ))}
            </div>
            <button className="mt-3 text-xs text-[#101e3d] underline">View all →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
