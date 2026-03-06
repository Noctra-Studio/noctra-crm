"use client";

import { useQuiz, MainGoal as MainGoalEnum } from "../QuizContext";
import { Check, ArrowRight } from "lucide-react";
import { LazyMotion, m, domAnimation } from "framer-motion";

export const MainGoals = () => {
  const { answers, setAnswer, nextStep } = useQuiz();

  const options = [
    {
      id: "get-inquiries",
      label: "Get more customer inquiries",
      desc: "Increase contact form submissions and calls",
    },
    {
      id: "sell-online",
      label: "Sell products or services online",
      desc: "Enable direct purchases through the website",
    },
    {
      id: "build-credibility",
      label: "Build credibility and trust",
      desc: "Professional presence that establishes authority",
    },
    {
      id: "automate",
      label: "Automate repetitive tasks",
      desc: "Reduce manual work with automated systems",
    },
    {
      id: "track-customers",
      label: "Track and understand customers",
      desc: "Analytics to know where customers come from",
    },
    {
      id: "reduce-dependency",
      label: "Reduce dependency on platforms",
      desc: "Own your customer data, less reliance on Instagram/Facebook",
    },
    {
      id: "improve-rankings",
      label: "Improve Google rankings",
      desc: "Show up when people search for your services",
    },
  ];

  const handleToggle = (id: string) => {
    const currentGoals = answers.mainGoals || [];
    let newGoals: MainGoalEnum[];

    if (currentGoals.includes(id as MainGoalEnum)) {
      newGoals = currentGoals.filter((g) => g !== id);
    } else {
      if (currentGoals.length >= 5) return; // Max 5
      newGoals = [...currentGoals, id as MainGoalEnum];
    }

    setAnswer("mainGoals", newGoals);
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          What&apos;s your main goal for your website?
        </h2>
        <p className="text-neutral-400">
          Select up to 5 priorities ({answers.mainGoals?.length || 0}/5
          selected)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => {
          const isSelected = answers.mainGoals?.includes(
            option.id as MainGoalEnum,
          );

          return (
            <m.button
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleToggle(option.id)}
              className={`
                w-full p-4 rounded-xl border text-left transition-all duration-200 group relative overflow-hidden
                flex items-center gap-4
                ${
                  isSelected
                    ? "bg-white border-white shadow-xl"
                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/50"
                }
              `}>
              <div
                className={`
                w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors
                ${isSelected ? "border-black bg-black text-white" : "border-neutral-600 group-hover:border-neutral-400"}
              `}>
                {isSelected && <Check className="w-4 h-4" />}
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

      <div className="pt-4 flex justify-end">
        <button
          onClick={nextStep}
          disabled={!answers.mainGoals || answers.mainGoals.length === 0}
          className={`
            px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all
            ${
              !answers.mainGoals || answers.mainGoals.length === 0
                ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-neutral-200 active:scale-95"
            }
          `}>
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
    </LazyMotion>
  );
};
