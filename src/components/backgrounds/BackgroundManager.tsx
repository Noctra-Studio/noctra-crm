"use client";

import { usePathname } from "next/navigation";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { StarField } from "./StarField";
import { CaseStudiesBackground } from "./CaseStudiesBackground";
import { GridStructure } from "@/components/backgrounds/GridStructure";
import { StaticNoise } from "@/components/backgrounds/StaticNoise";
import { MeteorShower } from "@/components/ui/MeteorShower";

import { useIntro } from "@/context/IntroContext";

export function BackgroundManager() {
  const pathname = usePathname();
  const { isIntroComplete } = useIntro();

  // Determine which background to show based on the current path
  const getBackground = () => {
    // Normalize pathname to handle locale prefixes if necessary
    // For now, we'll check if the pathname ends with or contains the route

    if (
      pathname === "/" ||
      pathname === "/en" ||
      pathname.length < 4 // Handles /en, /fr, /es, etc. dynamically
    ) {
      return <StarField key="starfield" />;
    }
    if (pathname.includes("/services")) {
      return <GridStructure key="grid" />;
    }
    if (pathname.includes("/case-studies")) {
      return <CaseStudiesBackground key="terrain" />;
    }
    if (pathname.includes("/contact") || pathname.includes("/")) {
      return null;
    }
    if (pathname.includes("/blog")) {
      return <StaticNoise key="noise" />;
    }
    if (pathname.includes("/about")) {
      return <MeteorShower key="meteors" />;
    }

    // Default fallback
    return <StarField key="default" />;
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="fixed inset-0 z-[-1] pointer-events-none bg-neutral-950"
        aria-hidden="true">
        <AnimatePresence mode="wait">
          <m.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0">
            {getBackground()}
          </m.div>
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
