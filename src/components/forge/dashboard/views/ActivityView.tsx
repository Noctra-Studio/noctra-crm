"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Upload,
  MessageSquare,
  FileText,
  Clock,
} from "lucide-react";

const MOCK_ACTIVITY = [
  {
    action: "Design approved",
    description: "Homepage V2 design has been approved",
    time: "14:30",
    date: "Today",
    type: "success" as const,
    icon: CheckCircle2,
  },
  {
    action: "Files uploaded",
    description: "3 new assets added to project folder",
    time: "11:15",
    date: "Today",
    type: "info" as const,
    icon: Upload,
  },
  {
    action: "Feedback submitted",
    description: "Client requested minor typography changes",
    time: "16:45",
    date: "Yesterday",
    type: "warning" as const,
    icon: MessageSquare,
  },
  {
    action: "Deliverable completed",
    description: "SEO audit report finalized",
    time: "09:20",
    date: "Nov 22",
    type: "success" as const,
    icon: FileText,
  },
  {
    action: "Meeting scheduled",
    description: "Design review call set for Friday",
    time: "14:00",
    date: "Nov 21",
    type: "info" as const,
    icon: Clock,
  },
];

export default function ActivityView() {
  const getEventColor = (type: string) => {
    if (type === "success") return "text-emerald-400 bg-emerald-400";
    if (type === "warning") return "text-amber-400 bg-amber-400";
    return "text-zinc-400 bg-zinc-400";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          Project Event Log
        </h1>
        <p className="text-sm text-zinc-400">
          Chronological timeline of all project events
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-gradient-to-b from-zinc-900 to-black border border-white/5 rounded-lg p-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {MOCK_ACTIVITY.map((event, i) => {
            const Icon = event.icon;
            const colorClass = getEventColor(event.type);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="relative flex gap-4">
                {/* Timeline Line */}
                {i !== MOCK_ACTIVITY.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-0 w-px bg-zinc-800" />
                )}

                {/* Icon/Dot */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center bg-zinc-900 border-2 ${
                      colorClass.split(" ")[1]
                    } border-opacity-50`}>
                    <Icon className={`w-3 h-3 ${colorClass.split(" ")[0]}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-medium text-white">
                      {event.action}
                    </h3>
                    <span className="text-xs font-mono text-zinc-500">
                      [{event.time}]
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">
                    {event.description}
                  </p>
                  <span className="text-xs text-zinc-600 font-mono">
                    {event.date}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
