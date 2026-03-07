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
    <div className="group bg-gradient-to-b from-zinc-900 to-black border border-white/5 hover:border-white/20 rounded-lg p-6 transition-colors duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-zinc-400" />
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

      {/* Main Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Total Budget
          </p>
          <p className="text-2xl font-mono font-bold text-white tracking-tight">
            ${totalBudget.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Spent
          </p>
          <p className="text-2xl font-mono font-bold text-zinc-500 tracking-tight">
            ${totalSpent.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Remaining
          </p>
          <p className="text-2xl font-mono font-bold text-white tracking-tight">
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
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
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
