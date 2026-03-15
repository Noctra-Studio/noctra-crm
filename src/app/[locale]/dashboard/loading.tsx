import { Settings2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 min-w-0 transition-all duration-200 min-h-[calc(100vh-64px)] relative w-full pointer-events-none">
      <div className="mobile-safe-x w-full flex-1 space-y-6 py-6 sm:px-6 lg:px-8 overflow-x-clip">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between animate-pulse">
          <div>
            <div className="h-2 w-24 bg-white/10 rounded-full mb-4" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-64 bg-white/10 rounded-lg" />
              <div className="h-5 w-24 bg-white/5 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 bg-white/5 rounded-lg" />
            <div className="h-10 w-40 bg-white/10 rounded-lg" />
          </div>
        </div>

        {/* Empty Alerts/Trials Space */}
        <div className="h-[72px] w-full bg-emerald-500/5 rounded-lg border border-emerald-500/10 animate-pulse mt-4 flex items-center px-4 gap-4">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20" />
            <div className="h-2 w-1/3 bg-white/10 rounded-full" />
        </div>

        {/* Widgets Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 auto-rows-[minmax(180px,auto)] lg:grid-cols-6 xl:grid-cols-12 mt-8">
          {/* KPI Row */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="lg:col-span-3 xl:col-span-3 h-[180px]">
              <div className="bg-[#111111] border border-neutral-900 rounded-xl h-full p-6 flex flex-col justify-between animate-pulse">
                <div>
                   <div className="h-3 w-28 bg-white/10 rounded-full mb-6" />
                   <div className="h-10 w-24 bg-white/5 rounded-lg" />
                   <div className="h-3 w-36 bg-white/5 rounded-full mt-4" />
                </div>
                <div className="flex justify-end mt-auto pt-4 border-t border-white/5">
                   <div className="h-2 w-16 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          ))}

          {/* Activity/Metrics Row */}
          <div className="lg:col-span-6 xl:col-span-7 h-[420px]">
             <div className="bg-[#111111] border border-neutral-900 rounded-xl h-full flex flex-col animate-pulse">
                <div className="p-6 md:p-8 flex-none border-b border-neutral-900 bg-[#0a0a0a] rounded-t-xl flex justify-between">
                    <div className="h-4 w-32 bg-white/10 rounded-full" />
                    <div className="h-6 w-48 bg-white/5 rounded-full" />
                </div>
                <div className="p-6 flex flex-col gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                            <div className="flex flex-col gap-2 w-full">
                                <div className="h-3 w-2/3 bg-white/10 rounded-full" />
                                <div className="h-2 w-1/4 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
          
          {/* Pipeline Snapshot */}
          <div className="lg:col-span-6 xl:col-span-5 h-[420px]">
             <div className="bg-[#111111] border border-neutral-900 rounded-xl h-full p-6 flex flex-col animate-pulse">
                <div className="h-3 w-24 bg-white/10 rounded-full mb-4" />
                <div className="h-10 w-48 bg-white/5 rounded-lg mb-8" />
                
                <div className="flex gap-4 h-full">
                    <div className="flex-1 bg-white/[0.02] rounded-xl p-4 flex flex-col gap-4">
                         <div className="h-2 w-20 bg-white/10 rounded-full" />
                         <div className="h-8 w-24 bg-white/5 rounded-lg" />
                         <div className="border-t border-white/5 mt-2 pt-4 flex flex-col gap-3">
                             <div className="h-2 w-full bg-white/5 rounded-full" />
                             <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                         </div>
                    </div>
                    <div className="flex-1 bg-white/[0.02] rounded-xl p-4 flex flex-col gap-4">
                         <div className="h-2 w-20 bg-white/10 rounded-full" />
                         <div className="h-8 w-24 bg-white/5 rounded-lg" />
                         <div className="border-t border-white/5 mt-2 pt-4 flex flex-col gap-3">
                             <div className="h-2 w-full bg-white/5 rounded-full" />
                             <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                         </div>
                    </div>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
