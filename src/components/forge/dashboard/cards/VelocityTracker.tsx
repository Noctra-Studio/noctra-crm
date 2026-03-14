"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

import { DashboardData } from "@/types/dashboard";

interface VelocityTrackerProps {
  services: DashboardData["services"];
}

export default function VelocityTracker({ services }: VelocityTrackerProps) {
  const overallProgress = Math.round(
    services.reduce((acc, curr) => acc + curr.progress_percentage, 0) /
      (services.length || 1)
  );

  const circumference = 2 * Math.PI * 54; // radius = 54
  const offset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="group rounded-[1.75rem] border border-white/6 bg-gradient-to-b from-zinc-900 to-black p-5 transition-colors duration-500 hover:border-white/18 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800">
          <TrendingUp className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h3 className="text-sm font-sans tracking-tight text-white font-semibold">
            Project Completion
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Overall Progress
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-zinc-800"
            />
            {/* Progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className="text-white"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              {overallProgress}%
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Complete
            </span>
          </div>
        </div>
      </div>

      {/* Track Breakdown */}
      <div className="space-y-3">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          Sub-Tracks
        </p>
        {services.map((track, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3 sm:flex-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  track.progress_percentage >= 80
                    ? "bg-white"
                    : track.progress_percentage >= 50
                    ? "bg-zinc-500"
                    : "bg-zinc-600"
                }`}
              />
              <span className="truncate text-[10px] uppercase tracking-widest text-zinc-500">
                {track.name}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:justify-end">
              <div className="h-1.5 w-full max-w-40 rounded-full bg-zinc-800 overflow-hidden sm:w-24">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${track.progress_percentage}%` }}
                  transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                  className={`h-full ${
                    track.progress_percentage >= 80
                      ? "bg-white"
                      : track.progress_percentage >= 50
                      ? "bg-zinc-500"
                      : "bg-zinc-600"
                  }`}
                />
              </div>
              <span className="text-xs font-mono font-medium text-zinc-400 w-10 text-right">
                {track.progress_percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
