"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = ({ value, min, max, step, onValueChange, className }: { 
  value: number[], 
  min: number, 
  max: number, 
  step: number, 
  onValueChange: (v: number[]) => void,
  className?: string
}) => {
  return (
    <div className={cn("relative w-full h-6 flex items-center group", className)}>
      <div className="absolute w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500" 
          style={{ width: `${((value[0] - min) / (max - min)) * 100}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div 
        className="absolute h-4 w-4 rounded-full border border-emerald-500/50 bg-white ring-offset-background transition-transform duration-200 group-hover:scale-110 pointer-events-none shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        style={{ left: `calc(${((value[0] - min) / (max - min)) * 100}% - 8px)` }}
      />
    </div>
  )
}

export { Slider }
