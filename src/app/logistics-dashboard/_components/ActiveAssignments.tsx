import { AssignedJob, JobStage, assignedJobs } from "./data";

function stagePill(stage: JobStage) {
  switch (stage) {
    case "Loading":
      return "bg-orange-50 text-orange-600";
    case "In Transit":
      return "bg-blue-50 text-blue-600";
    case "Awaiting Pickup":
      return "bg-gray-100 text-gray-500";
    case "Delivered":
      return "bg-green-50 text-green-600";
  }
}

export default function ActiveAssignments({
  onView,
}: {
  onView: (job: AssignedJob) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-semibold text-gray-900">Active Assignments</h2>
        <span className="rounded-full bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1">
          7 in progress
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 uppercase tracking-wide">
              <th className="font-medium pb-2">Job ID</th>
              <th className="font-medium pb-2">Route</th>
              <th className="font-medium pb-2">Vehicle</th>
              <th className="font-medium pb-2">Current Stage</th>
              <th className="font-medium pb-2">ETA</th>
              <th className="font-medium pb-2 text-right">&nbsp;</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignedJobs.map((job) => (
              <tr key={job.jobId}>
                <td className="py-3 font-medium text-primary">{job.jobId}</td>
                <td className="py-3 text-gray-700">{job.route}</td>
                <td className="py-3 text-gray-700">{job.vehicle}</td>
                <td className="py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stagePill(job.stage)}`}>
                    {job.stage}
                  </span>
                </td>
                <td className="py-3 text-gray-500">{job.eta}</td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => onView(job)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="text-sm text-primary font-medium mt-4 hover:underline">
        View All Assigned Jobs →
      </button>
    </div>
  );
}
