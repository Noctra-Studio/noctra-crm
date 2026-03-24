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

  // Mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Only run on homepage
    const isHomePage =
      pathname === "/" || pathname === "/en" || pathname === "/es";

    if (!isHomePage) {
      setIsIntroComplete(true);
      setShowIntro(false);
      setInitialized(true);
      return;
    }

    // Check storage
    const hasSeenIntro = sessionStorage.getItem("intro-played");
    if (hasSeenIntro) {
      setIsIntroComplete(true);
      setShowIntro(false);
    } else {
      // If we are on homepage and haven't seen intro, show it
      setIsIntroComplete(false);
      setShowIntro(true);
    }
    setInitialized(true);
  }, [pathname, mounted]);

  const setIntroComplete = () => {
    setIsIntroComplete(true);
    setShowIntro(false);
    sessionStorage.setItem("intro-played", "true");
  };

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
