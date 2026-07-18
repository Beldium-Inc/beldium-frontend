"use client";

import { useState } from "react";
import LogisticsSidebar, { NavKey } from "./_components/Sidebar";
import LogisticsHeader from "./_components/Header";
import StatsRow from "./_components/StatsRow";
import PriorityOpportunities from "./_components/PriorityOpportunities";
import ActiveAssignments from "./_components/ActiveAssignments";
import RecentActivity from "./_components/RecentActivity";
import OperationalNotifications from "./_components/OperationalNotifications";
import FleetStatusCard from "./_components/FleetStatusCard";
import RecentEarnings from "./_components/RecentEarnings";
import OpportunityDetailPanel from "./_components/OpportunityDetailPanel";
import SubmitInterestModal from "./_components/SubmitInterestModal";
import JobTrackingPanel from "./_components/JobTrackingPanel";
import { AssignedJob, Opportunity } from "./_components/data";

export default function LogisticsDashboardPage() {
  const [active, setActive] = useState<NavKey>("overview");
  const [detailOpportunity, setDetailOpportunity] = useState<Opportunity | null>(null);
  const [interestOpportunity, setInterestOpportunity] = useState<Opportunity | null>(null);
  const [trackingJob, setTrackingJob] = useState<AssignedJob | null>(null);

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden">
      <LogisticsSidebar active={active} onNavigate={setActive} />

      <div className="flex-1 flex flex-col min-w-0">
        <LogisticsHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Good Morning, Alpha Logistics</h1>
            <p className="text-sm text-gray-400 mt-1">
              Here&apos;s an overview of today&apos;s transport operations, opportunities, and fleet activity.
            </p>
          </div>

          <div className="space-y-5">
            <StatsRow />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 space-y-5">
                <PriorityOpportunities
                  onViewDetails={setDetailOpportunity}
                  onSubmitInterest={setInterestOpportunity}
                />
                <ActiveAssignments onView={setTrackingJob} />
                <RecentActivity />
              </div>

              <div className="space-y-5">
                <OperationalNotifications />
                <FleetStatusCard />
                <RecentEarnings />
              </div>
            </div>
          </div>
        </main>
      </div>

      <OpportunityDetailPanel
        opportunity={detailOpportunity}
        onClose={() => setDetailOpportunity(null)}
        onSubmitInterest={(opp) => {
          setDetailOpportunity(null);
          setInterestOpportunity(opp);
        }}
      />

      <JobTrackingPanel job={trackingJob} onClose={() => setTrackingJob(null)} />

      {interestOpportunity && (
        <SubmitInterestModal
          opportunity={interestOpportunity}
          onClose={() => setInterestOpportunity(null)}
        />
      )}
    </div>
  );
}
