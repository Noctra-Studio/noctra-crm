"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// Expose Lenis instance globally so modals can stop/start it
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll() {
  const pathname = usePathname();
  const isForge = pathname.startsWith("/") || pathname.includes("/");

  useEffect(() => {
    // Forge uses its own native scroll containers — skip Lenis entirely
    if (isForge) return;

    let lenis: Lenis;
    let animationFrameId: number;

    const timer = setTimeout(() => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 2,
      });

      window.__lenis = lenis;

      function raf(time: number) {
        lenis.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);
    }, 1000); // Defer to unblock main thread

    return () => {
      clearTimeout(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenis) {
        lenis.destroy();
        delete window.__lenis;
      }
    };
  }, [isForge]);

  return null;
}
