"use client";

import {
  useQuiz,
  CurrentSituation as CurrentSituationEnum,
} from "../QuizContext";
import { LazyMotion, m, domAnimation } from "framer-motion";

export const CurrentSituation = () => {
  const { answers, setAnswer, nextStep } = useQuiz();

  const options = [
    {
      id: "no-website",
      label: "No website yet",
      desc: "Just getting started, need everything built from scratch",
    },
    {
      id: "basic-website",
      label: "Have a basic website",
      desc: "It exists but looks outdated or doesn't work well",
    },
    {
      id: "poor-results",
      label: "Have a website but poor results",
      desc: "Gets traffic but doesn't convert visitors into clients",
    },
    {
      id: "social-only",
      label: "Using Instagram/Facebook only",
      desc: "Relying on social media, no dedicated website",
    },
    {
      id: "add-features",
      label: "Have a good website, want to add features",
      desc: "Current site works but needs expansion or optimization",
    },
  ];

  const handleSelect = (id: string) => {
    setAnswer("currentSituation", id as CurrentSituationEnum);
    setTimeout(nextStep, 300);
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          What&apos;s your current website situation?
        </h2>
        <p className="text-neutral-400">
          This helps us understand your starting point.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = answers.currentSituation === option.id;

          return (
            <m.button
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelect(option.id)}
              className={`
                w-full p-4 rounded-xl border text-left transition-all duration-200 group
                flex items-center gap-4
                ${
                  isSelected
                    ? "bg-white border-white shadow-xl"
                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/50"
                }
              `}>
              <div
                className={`
                w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                ${isSelected ? "border-black bg-black" : "border-neutral-600 group-hover:border-neutral-400 mb-auto mt-1"}
              `}>
                {isSelected && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              <div>
                <div
                  className={`font-bold text-base ${isSelected ? "text-black" : "text-neutral-200 group-hover:text-white"}`}>
                  {option.label}
                </div>
                <div
                  className={`text-sm mt-0.5 ${isSelected ? "text-neutral-400" : "text-neutral-300 group-hover:text-neutral-400"}`}>
                  {option.desc}
                </div>
              </div>
            </m.button>
          );
        })}
      </div>
    </div>
    </LazyMotion>
  );
};
