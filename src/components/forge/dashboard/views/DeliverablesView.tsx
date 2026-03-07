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
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Deliverables</h2>
          <p className="text-neutral-300">
            All project deliverables and assets
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="space-y-3">
            {deliverables.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-neutral-900 text-neutral-400 group-hover:text-white transition-colors">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-neutral-300">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-neutral-300">{item.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
