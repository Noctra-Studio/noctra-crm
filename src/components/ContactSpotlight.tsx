"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function ContactSpotlight() {
  const pathname = usePathname();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isMounted = useRef(true);

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMounted.current) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      isMounted.current = false;
    };
  }, [mouseX, mouseY]);

  const spotlightBackground = useTransform(
    [mouseX, mouseY],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ([x, y]: any[]) =>
      `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 80%)`
  );

  // Kill switch: If we are not on the contact page, do not render the spotlight.
  // This prevents the spotlight from lingering during page transitions.
  if (pathname && !pathname.includes("/contact")) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: spotlightBackground,
      }}
    />
  );
}
