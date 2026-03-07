"use client";

import { Calendar, Circle } from "lucide-react";

import { DashboardData } from "@/types/dashboard";

interface ActiveWorkerProps {
  worker?: DashboardData["activeWorker"] | null;
}

export default function ActiveWorker({ worker }: ActiveWorkerProps) {
  const statusConfig = {
    coding: { emoji: "🟢", label: "Coding", color: "text-emerald-400" },
    meeting: { emoji: "🟡", label: "In Meeting", color: "text-amber-400" },
    online: { emoji: "🟢", label: "Online", color: "text-emerald-400" },
    offline: { emoji: "⚫", label: "Offline", color: "text-zinc-500" },
  };

  // Default to offline if no worker data is present
  const currentStatus = worker
    ? statusConfig[worker.current_status] || statusConfig.offline
    : statusConfig.offline;

  // Contextual button text based on status
  const getButtonText = () => {
    if (!worker) return "Request Call / Sync";
    if (worker.current_status === "coding") return "Schedule Sync";
    if (worker.current_status === "meeting") return "Join Huddle";
    return "Request Call / Sync";
  };

  return (
    <div className="group bg-gradient-to-b from-zinc-900 to-black border border-white/5 hover:border-white/20 rounded-lg p-6 relative overflow-hidden transition-colors duration-500">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center">
            <Circle className="w-5 h-5 text-zinc-400 fill-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-sans tracking-tight text-white font-semibold">
              Active Worker
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Live Status
            </p>
          </div>
        </div>

        {/* Worker Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-white">
              {worker?.worker_name
                ? worker.worker_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "?"}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-white mb-2">
              {worker?.worker_name || "No Active Worker"}
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="relative flex items-center">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    worker ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"
                  }`}></span>
              </div>
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Current Task */}
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-md p-4 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
            Currently working on:
          </p>
          <p className="text-sm text-white font-medium">
            {worker?.current_task || "No active tasks"}
          </p>
        </div>

        {/* CTA Button with Glow */}
        <a
          href="https://calendly.com/noctra-studio"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-md border border-zinc-700 text-zinc-300 font-medium text-sm flex items-center justify-center gap-2 hover:border-white hover:text-white transition-colors">
          <Calendar className="w-4 h-4" />
          <span>{getButtonText()}</span>
        </a>
      </div>
    </div>
  );
}
