"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Sidebar from "@/components/forge/dashboard/Sidebar";
import { Cursor } from "@/components/ui/cursor";

export default function DashboardLayoutClient({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const spotlightBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]: number[]) =>
      `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
  );

  return (
    <>
      {/* Custom Cursor */}
      <Cursor />

      {/* Spotlight Background Effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: spotlightBackground,
        }}
      />

      <div className="relative z-10 flex h-dvh min-w-0 w-full max-w-full overflow-hidden bg-black text-white">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          userEmail={profile?.full_name || profile?.company_name}
        />

        <main className="relative z-20 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <div className="mobile-safe-x flex-1 overflow-y-auto py-4 sm:px-6 sm:py-6 scroll-smooth">
            {children}
          </div>

          {/* Footer */}
          <footer className="border-t border-white/5 py-4 bg-black/50 backdrop-blur-sm">
            <p className="text-[10px] text-neutral-500 text-center font-mono uppercase tracking-widest">
              © 2026 Noctra Studio. PROCESSED SECURELY.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
