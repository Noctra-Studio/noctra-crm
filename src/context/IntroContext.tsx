"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface IntroContextType {
  isIntroComplete: boolean;
  showIntro: boolean;
  setIntroComplete: () => void;
  initialized: boolean;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Initialize with safe defaults to prevent hydration mismatch
  const [isIntroComplete, setIsIntroComplete] = useState(true); // Start as complete to avoid flicker
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Handle mounting and intro logic in a single effect to avoid cascading renders
  useEffect(() => {
    setMounted(true);

    // Only run on homepage
    const isHomePage =
      pathname === "/" || pathname === "/en" || pathname === "/es";

    if (!isHomePage) {
      setIsIntroComplete(true);
      setShowIntro(false);
      setInitialized(true);
      return;
    }

    // Check storage for intro preference
    const hasSeenIntro = sessionStorage.getItem("intro-played");
    if (hasSeenIntro) {
      setIsIntroComplete(true);
      setShowIntro(false);
    } else {
      setIsIntroComplete(false);
      setShowIntro(true);
    }
    setInitialized(true);
  }, [pathname]);

  const setIntroComplete = () => {
    setIsIntroComplete(true);
    setShowIntro(false);
    sessionStorage.setItem("intro-played", "true");
  };

  if (!mounted) return null;

  return (
    <IntroContext.Provider
      value={{ isIntroComplete, showIntro, setIntroComplete, initialized }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (context === undefined) {
    throw new Error("useIntro must be used within an IntroProvider");
  }
  return context;
}
