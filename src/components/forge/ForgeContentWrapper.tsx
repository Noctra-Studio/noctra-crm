"use client";

import { usePathname } from "next/navigation";
import { ForgePageTransition } from "./ForgePageTransition";

import { useEffect, useRef } from "react";

export function ForgeContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("forge-page-enter");
    void el.offsetHeight; // trigger reflow
    el.classList.add("forge-page-enter");
  }, [pathname]);

  return (
    <div
      ref={ref}
      className="forge-page-enter min-w-0 w-full overflow-x-clip"
      style={{ minHeight: "100%" }}>
      {children}
    </div>
  );
}
