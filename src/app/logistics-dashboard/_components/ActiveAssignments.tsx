import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { AssignedJob, JobStage, assignedJobs } from "./data";

function stageStyle(stage: JobStage) {
  switch (stage) {
    case "Loading":
      return statusStyles.amber;
    case "In Transit":
      return statusStyles.cyan;
    case "Awaiting Pickup":
      return statusStyles.slate;
    case "Delivered":
      return statusStyles.green;
  }
}

export default function ActiveAssignments({
  onView,
}: {
  onView: (job: AssignedJob) => void;
}) {
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-semibold text-[#172554]">Active Assignments</h2>
        <span className="rounded-full bg-[#edf8fb] text-[#2387a3] text-xs font-medium px-2.5 py-1">Preview</span>
      </div>
      <p className="text-xs text-[#8b93a1] -mt-2 mb-4">
        Sample preview: see the Assigned Jobs tab for your live, backend-connected list.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-[#8b93a1] uppercase tracking-wide">
              <th className="font-medium pb-2">Job ID</th>
              <th className="font-medium pb-2">Route</th>
              <th className="font-medium pb-2">Vehicle</th>
              <th className="font-medium pb-2">Current Stage</th>
              <th className="font-medium pb-2">ETA</th>
              <th className="font-medium pb-2 text-right">&nbsp;</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1f7]">
            {assignedJobs.map((job) => {
              const pill = stageStyle(job.stage);
              return (
                <tr key={job.jobId}>
                  <td className="py-3 font-medium text-[#101e3d]">{job.jobId}</td>
                  <td className="py-3 text-[#293041]">{job.route}</td>
                  <td className="py-3 text-[#293041]">{job.vehicle}</td>
                  <td className="py-3">
                    <span className={classNames("text-xs font-medium px-2.5 py-1 rounded-full", pill.container)}>
                      {job.stage}
                    </span>
                  </td>
                  <td className="py-3 text-[#6f7786]">{job.eta}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onView(job)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
