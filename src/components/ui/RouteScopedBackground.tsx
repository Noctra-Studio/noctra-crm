"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  LazyMotion,
  m,
  domAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

export function RouteScopedBackground() {
  const pathname = usePathname();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isMounted = useRef(true);

  // Mouse tracking effect
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ([x, y]: any[]) =>
      `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
  );

  // STRICT check. If we are not exactly on /contact (or /es/contact), KILL the component.
  if (!pathname?.includes("/contact")) return null;

  return (
    <m.div
      className="fixed inset-0 pointer-events-none z-[0]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundImage: spotlightBackground,
      }}
    />
  );
}
