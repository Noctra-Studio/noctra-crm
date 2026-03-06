"use client";

import React, { useEffect, useState } from "react";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { useIntro } from "@/context/IntroContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function IntroLoader() {
  const { showIntro, setIntroComplete } = useIntro();
  const [step, setStep] = useState(1); // 1: Text, 2: Logo In, 3: Logo Out, 4: Curtain Lift

  useEffect(() => {
    if (!showIntro) return;

    const sequence = async () => {
      // Phase 1: Text Sequence
      // Duration: 3500ms (1500ms "Clarity" + 1500ms "Results" + 500ms overlap/padding)
      await new Promise((r) => setTimeout(r, 3500));

      // Phase 2: Logo Reveal (Fade In)
      // Duration Adjusted to 1200ms
      setStep(2);
      await new Promise((r) => setTimeout(r, 1200));

      // Phase 3: Logo Exit (Fade Out)
      // Duration Adjusted to 600ms
      setStep(3);
      await new Promise((r) => setTimeout(r, 600));

      // Phase 4: Curtain Lift
      setStep(4);
      await new Promise((r) => setTimeout(r, 600));

      setIntroComplete();
    };

    sequence();
  }, [showIntro, setIntroComplete]);

  if (!showIntro) return null;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        aria-hidden="true"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
        initial="initial">
        {/* Background Curtain */}
        <m.div
          className="absolute inset-0 bg-[#050505] z-0 pointer-events-auto"
          initial={{ opacity: 1 }}
          animate={{ opacity: step === 4 ? 0 : 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Phase 1: Text Sequence */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <m.div
              key="text"
              initial={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-10 flex items-center justify-center">
              <TextSequence />
            </m.div>
          )}
        </AnimatePresence>

        {/* Phase 2 & 3: Logo Reveal & Exit */}
        <AnimatePresence>
          {step === 2 && (
            <m.div
              key="logo"
              initial={{ opacity: 0, filter: "blur(12px)", scale: 0.92, x: 0 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1, x: 0 }}
              exit={{
                opacity: 0,
                filter: "blur(8px)",
                scale: 1.04,
                x: 0,
                transition: { duration: 0.6 },
              }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-20 flex items-center justify-center">
              <BrandLogo className="text-white w-64 md:w-96 h-auto" />
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </LazyMotion>
  );
}

import { useLocale } from "next-intl";

function TextSequence() {
  const locale = useLocale();
  const [wordIndex, setWordIndex] = useState(0);

  const wordsByLocale: Record<string, string[]> = {
    en: ["Clarity first.", "Results after."],
    es: ["Claridad primero.", "Resultados después."],
  };

  const words = wordsByLocale[locale] ?? wordsByLocale.en;

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev < words.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <AnimatePresence mode="wait">
      <m.span
        key={wordIndex}
        initial={{ opacity: 0, filter: "blur(8px)", y: 12, x: 0 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0, x: 0 }}
        exit={{ opacity: 0, filter: "blur(8px)", y: -12, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-5xl md:text-8xl font-black font-sans text-white tracking-widest uppercase text-center leading-none px-4">
        {words[wordIndex]}
      </m.span>
    </AnimatePresence>
  );
}
