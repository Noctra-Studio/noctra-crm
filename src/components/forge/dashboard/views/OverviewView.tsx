"use client";

import HeaderGreeting from "../HeaderGreeting";
import BudgetTracker from "../cards/BudgetTracker";
import VelocityTracker from "../cards/VelocityTracker";
import ActiveWorker from "../cards/ActiveWorker";
import ApprovalCard from "../ApprovalCard";

import { DashboardData } from "@/types/dashboard";

interface OverviewViewProps {
  data: DashboardData | null;
  userEmail?: string; // Keep for backward compatibility if needed, but data.profile is better
}

export default function OverviewView({ data }: OverviewViewProps) {
  if (!data) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <HeaderGreeting
          companyName={data.profile.company_name}
          fullName={data.profile.full_name}
        />

        {/* Top Row: 3-Column Grid - Never shrinks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 flex-shrink-0">
          <BudgetTracker
            totalBudget={data.project.total_budget}
            services={data.services}
          />
          <VelocityTracker services={data.services} />
          <ActiveWorker worker={data.activeWorker} />
        </div>

        {/* Bottom Row: Full Width Action Required - Fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="relative h-full">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-xl" />
            <div className="relative h-full">
              <ApprovalCard deliverable={data.deliverable} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
