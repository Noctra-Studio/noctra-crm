"use client";

import { useQuiz } from "./QuizContext";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { useEffect } from "react";

// Steps
import { Welcome } from "./steps/Welcome";
import { BusinessType } from "./steps/BusinessType";
import { CurrentSituation } from "./steps/CurrentSituation";
import { MainGoals } from "./steps/MainGoals";
import { Timeline } from "./steps/Timeline";
import { Budget } from "./steps/Budget";
import { Contact } from "./steps/Contact";
import { Results } from "./steps/Results";

const STEPS = [
  Welcome,
  BusinessType,
  CurrentSituation,
  MainGoals,
  Timeline,
  Budget,
  Contact,
  Results, // Step 7
];

export function QuizModal() {
  const { isModalOpen, closeQuiz, currentStep, prevStep, totalSteps } =
    useQuiz();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const CurrentComponent = STEPS[currentStep];
  const isResults = currentStep === STEPS.length - 1;
  const progress = currentStep > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <LazyMotion features={domAnimation}>
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 overscroll-contain">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeQuiz}
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full h-[100dvh] md:h-auto md:max-h-[90vh] max-w-2xl bg-neutral-900 border-0 md:border border-neutral-800 rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header (Progress & Close) */}
            {!isResults && (
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-white">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  {currentStep > 0 && (
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider">
                        Question {currentStep} of {totalSteps - 1}
                      </span>
                      <div className="w-32 h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                        <m.div
                          className="h-full bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={closeQuiz}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-8 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
              <CurrentComponent />
            </div>

            {/* Footer is handled by individual steps if needed, or we can add a global one here */}
          </m.div>
        </div>
      )}
    </AnimatePresence>
    </LazyMotion>
  );
}
