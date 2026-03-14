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
    <div className="flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 min-h-0 sm:gap-6">
        <HeaderGreeting
          companyName={data.profile.company_name}
          fullName={data.profile.full_name}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BudgetTracker
            totalBudget={data.project.total_budget}
            services={data.services}
          />
          <VelocityTracker services={data.services} />
          <ActiveWorker worker={data.activeWorker} />
        </div>

        <div className="flex-1 min-h-0">
          <div className="relative h-full">
            <div className="absolute inset-0 rounded-[1.75rem] bg-blue-500/12 blur-3xl" />
            <div className="relative h-full">
              <ApprovalCard deliverable={data.deliverable} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
