"use client";

import { AnimatePresence, motion } from "framer-motion";
import OverviewView from "@/components/dashboard/views/OverviewView";
import TasksView from "@/components/dashboard/views/TasksView";
import ActivityView from "@/components/dashboard/views/ActivityView";
import DeliverablesView from "@/components/dashboard/views/DeliverablesView";
import FinancialsView from "@/components/dashboard/views/FinancialsView";
import SettingsView from "@/components/dashboard/views/SettingsView";
import { DashboardData } from "@/types/dashboard";
import { useSearchParams } from "next/navigation";

type TabType =
  | "overview"
  | "deliverables"
  | "financials"
  | "settings"
  | "tasks"
  | "activity";

interface DashboardClientProps {
  initialData: DashboardData | null;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabType) || "overview";

  const renderView = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewView key="overview" data={initialData} />;
      case "tasks":
        return <TasksView key="tasks" />;
      case "activity":
        return <ActivityView key="activity" />;
      case "deliverables":
        return <DeliverablesView key="deliverables" />;
      case "financials":
        return <FinancialsView key="financials" />;
      case "settings":
        return <SettingsView key="settings" />;
      default:
        return <OverviewView key="overview" data={initialData} />;
    }
  };

  if (!initialData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-xl font-bold">Welcome to Noctra</h1>
        <p className="text-neutral-400 text-sm">
          Setting up your environment...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full flex flex-col">
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
