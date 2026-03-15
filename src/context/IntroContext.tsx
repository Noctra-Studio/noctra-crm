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

  // Safe SSR defaults: intro complete, nothing shown. These match on server
  // AND client first render, so hydration is clean. The useEffect below will
  // override them on the homepage when the intro hasn't been seen yet.
  const [isIntroComplete, setIsIntroComplete] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const isHomePage =
      pathname === "/" || pathname === "/en" || pathname === "/es";

    if (!isHomePage) {
      setIsIntroComplete(true);
      setShowIntro(false);
      setInitialized(true);
      return;
    }

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
