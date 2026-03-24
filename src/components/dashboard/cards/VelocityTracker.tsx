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
    <div className="group bg-gradient-to-b from-zinc-900 to-black border border-white/5 hover:border-white/20 rounded-lg p-6 transition-colors duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-zinc-400" />
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

      {/* Circular Progress */}
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
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  track.progress_percentage >= 80
                    ? "bg-white"
                    : track.progress_percentage >= 50
                    ? "bg-zinc-500"
                    : "bg-zinc-600"
                }`}
              />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                {track.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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
