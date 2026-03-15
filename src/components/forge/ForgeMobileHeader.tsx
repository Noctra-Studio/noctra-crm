"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { ForgeMobileNav } from "./ForgeMobileNav";
import { ChatWidget } from "@/components/ui/ChatWidget";

export function ForgeMobileHeader() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <Sheet open={navOpen} onOpenChange={setNavOpen}>
      <header className="mobile-safe-x md:hidden sticky top-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 h-14 flex items-center justify-between gap-3">
        {/* Left: Logo */}
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src="/images/noctra-logo-white.png"
            alt="Noctra Studio"
            width={70}
            height={20}
            className="h-auto w-auto max-w-[min(8rem,calc(100vw-5.5rem))] opacity-90"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 -mr-2">
          <ChatWidget variant="headerAction" />

          <SheetTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/5 hover:text-white shrink-0"
              aria-label="Abrir menú de navegación"
              aria-expanded={navOpen}
              aria-controls="forge-mobile-nav">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
        </div>
      </header>

      <ForgeMobileNav open={navOpen} onOpenChange={setNavOpen} />
    </Sheet>
  );
}
