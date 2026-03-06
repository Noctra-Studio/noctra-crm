"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { MobileProfileDrawer } from "./modals/MobileProfileDrawer";

export function ForgeMobileHeader() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 h-14 px-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/noctra-logo-white.png"
            alt="Noctra Studio"
            width={70}
            height={20}
            className="opacity-90"
          />
        </div>

        {/* Right: Hamburger Menu */}
        <button
          onClick={() => setProfileOpen(true)}
          className="p-2 -mr-2 text-white/70 hover:text-white transition-colors"
          aria-label="Abrir menú de navegación">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Reusing existing MobileProfileDrawer for navigation links */}
      <MobileProfileDrawer
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
