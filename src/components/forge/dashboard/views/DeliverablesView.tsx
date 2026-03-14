"use client";

import { ExternalLink, Rocket, CheckCircle2, Clock } from "lucide-react";

const deliverables = [
  {
    name: "Homepage V2",
    url: "#",
    status: "In Review",
    date: "Today",
    description: "Complete homepage redesign",
  },
  {
    name: "Design System",
    url: "#",
    status: "Approved",
    date: "Nov 20",
    description: "Component library and tokens",
  },
  {
    name: "Wireframes",
    url: "#",
    status: "Approved",
    date: "Nov 15",
    description: "Initial wireframes",
  },
  {
    name: "User Research",
    url: "#",
    status: "Completed",
    date: "Nov 10",
    description: "User interviews and testing",
  },
  {
    name: "Brand Guidelines",
    url: "#",
    status: "Approved",
    date: "Nov 5",
    description: "Logo, colors, typography",
  },
];

export default function DeliverablesView() {
  return (
    <div className="h-full">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Deliverables</h2>
          <p className="text-neutral-300">
            All project deliverables and assets
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
          <div className="space-y-3">
            {deliverables.map((item, i) => (
              <div
                key={i}
                className="group flex flex-col gap-4 rounded-[1.35rem] border border-neutral-800 bg-neutral-950/50 p-4 transition-colors hover:border-neutral-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-1 items-start gap-4">
                  <div className="rounded-2xl bg-neutral-900 p-2 text-neutral-400 transition-colors group-hover:text-white">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-neutral-300">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="sm:text-right">
                    <p className="text-xs text-neutral-300">{item.date}</p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "Approved" || item.status === "Completed"
                        ? "bg-green-500/10 text-green-400"
                        : item.status === "In Review"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-neutral-800 text-neutral-400"
                    }`}>
                    {item.status === "Approved" ||
                    item.status === "Completed" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.status}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Open
                    <ExternalLink className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
