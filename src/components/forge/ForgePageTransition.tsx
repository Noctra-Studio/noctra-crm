"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Handles the "materialize" (enter) animation for Forge pages.
 * The "evaporate" (exit) effect is handled naturally as the component remounts
 * via the 'key' prop on the parent wrapper.
 */
export function ForgePageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Remove class first to reset animation
    el.classList.remove("forge-page-enter");

    // Force reflow so animation restarts
    void el.offsetHeight;

    // Add class to trigger enter animation
    el.classList.add("forge-page-enter");
  }, [pathname]);

  return (
    <div
      ref={ref}
      className="forge-page-enter"
      style={{ minHeight: "100%", width: "100%" }}>
      {children}
    </div>
  );
}
