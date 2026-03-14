"use client";

import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

import { DashboardData } from "@/types/dashboard";

interface BudgetTrackerProps {
  totalBudget: number;
  services: DashboardData["services"];
}

export default function BudgetTracker({
  totalBudget,
  services,
}: BudgetTrackerProps) {
  const totalSpent = services.reduce((acc, curr) => acc + curr.budget_spent, 0);
  const burnRate = (totalSpent / totalBudget) * 100;
  const remaining = totalBudget - totalSpent;

  const getStatusColor = (spent: number, allocated: number) => {
    const ratio = spent / allocated;
    if (ratio >= 1) return "text-emerald-400"; // Complete
    if (ratio > 0.8) return "text-amber-400"; // Warning
    return "text-emerald-400"; // Healthy
  };

  return (
    <div className="group rounded-[1.75rem] border border-white/6 bg-gradient-to-b from-zinc-900 to-black p-5 transition-colors duration-500 hover:border-white/18 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800">
          <DollarSign className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h3 className="text-sm font-sans tracking-tight text-white font-semibold">
            Financial Overview
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Budget & Allocation
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Total Budget
          </p>
          <p className="text-xl font-mono font-bold tracking-tight text-white sm:text-2xl">
            ${totalBudget.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Spent
          </p>
          <p className="text-xl font-mono font-bold tracking-tight text-zinc-500 sm:text-2xl">
            ${totalSpent.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Remaining
          </p>
          <p className="text-xl font-mono font-bold tracking-tight text-white sm:text-2xl">
            ${remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Burn Rate Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            Burn Rate
          </span>
          <span className="text-sm font-mono font-medium text-white">
            {burnRate.toFixed(0)}%
          </span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${burnRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-white"
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          Breakdown
        </p>
        {services.map((item, i) => {
          const percentage = (item.budget_spent / item.budget_allocated) * 100;
          return (
            <div key={i} className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {item.name}
                </span>
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="text-xs font-mono text-zinc-400">
                    ${item.budget_spent.toLocaleString()} / $
                    {item.budget_allocated.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium ${getStatusColor(
                      item.budget_spent,
                      item.budget_allocated
                    )}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full bg-white"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
