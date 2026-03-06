"use client";

import { useEffect, useState } from "react";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener("scroll", toggleVisibility, { passive: true });
    }, 2500); // Defer scroll listener attachment

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isVisible && (
          <m.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-40 p-3 rounded-full bg-neutral-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-neutral-900/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Scroll to top">
            <ArrowUp className="w-5 h-5" />
          </m.button>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
