"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-6 bg-[#0d0d0d] border border-white/5 px-6 py-3 rounded-full">
      <button
        onClick={() => onChange(subMonths(currentDate, 1))}
        className="p-1 text-neutral-500 hover:text-white transition-colors hover:scale-110 active:scale-95">
        <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <div className="flex flex-col items-center min-w-[140px]">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
          {format(currentDate, "MMMM yyyy")}
        </span>
      </div>

      <button
        onClick={() => onChange(addMonths(currentDate, 1))}
        className="p-1 text-neutral-500 hover:text-white transition-colors hover:scale-110 active:scale-95">
        <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
