"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  repeat?: number;
}

export function ForgeSkeleton({ className = "", repeat = 1 }: SkeletonProps) {
  const skeletons = Array.from({ length: repeat });

  return (
    <>
      {skeletons.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`bg-white/[0.05] rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

export function ForgeLeadListItemSkeleton() {
  return (
    <div className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <ForgeSkeleton className="h-4 w-1/2" />
          <ForgeSkeleton className="h-2 w-1/4" />
        </div>
        <ForgeSkeleton className="h-5 w-12 rounded" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <ForgeSkeleton className="h-2 w-20" />
        <ForgeSkeleton className="h-2 w-16" />
      </div>
    </div>
  );
}

export function ForgeMetricCardSkeleton({ repeat = 1 }: { repeat?: number }) {
  const skeletons = Array.from({ length: repeat });
  return (
    <>
      {skeletons.map((_, i) => (
        <div key={i} className="bg-[#0A0A0A] border border-white/5 p-6 space-y-4 rounded-xl">
          <div className="flex items-center gap-2">
            <ForgeSkeleton className="h-3.5 w-3.5 rounded-full" />
            <ForgeSkeleton className="h-3 w-24" />
          </div>
          <ForgeSkeleton className="h-8 w-32" />
        </div>
      ))}
    </>
  );
}

export function ForgeProposalRowSkeleton({ repeat = 5 }: { repeat?: number }) {
  const skeletons = Array.from({ length: repeat });
  return (
    <>
      {skeletons.map((_, i) => (
        <tr key={i} className="border-b border-white/[0.03]">
          <td className="py-4 px-4"><ForgeSkeleton className="h-3 w-16" /></td>
          <td className="py-4 px-4"><ForgeSkeleton className="h-3 w-32" /></td>
          <td className="py-4 px-4"><ForgeSkeleton className="h-3 w-24" /></td>
          <td className="py-4 px-4 text-right"><ForgeSkeleton className="h-3 w-20 ml-auto" /></td>
          <td className="py-4 px-4"><ForgeSkeleton className="h-5 w-24 rounded mx-auto" /></td>
          <td className="py-4 px-4"><ForgeSkeleton className="h-3 w-16" /></td>
          <td className="py-4 px-4 text-right"><ForgeSkeleton className="h-3 w-24 ml-auto" /></td>
          <td className="py-4 px-4 w-10"></td>
        </tr>
      ))}
    </>
  );
}
