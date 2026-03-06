"use client";

import { useQuiz, Timeline as TimelineEnum } from "../QuizContext";
import { Clock, Calendar, Rocket, Sparkles } from "lucide-react";
import { LazyMotion, m, domAnimation } from "framer-motion";

export const Timeline = () => {
  const { setAnswer, nextStep } = useQuiz();

  const options = [
    {
      id: "asap",
      label: "As soon as possible",
      desc: "1-2 weeks (rush project)",
      icon: Rocket,
      badge: "+20% urgency fee applies"
    },
    {
      id: "next-month",
      label: "Within the next month",
      desc: "Standard timeline (3-6 weeks)",
      icon: Clock,
      badge: "Recommended"
    },
    {
      id: "1-3-months",
      label: "In 1-3 months",
      desc: "Flexible timeline",
      icon: Calendar,
      badge: null
    },
    {
      id: "exploring",
      label: "Just exploring options",
      desc: "No specific timeline yet",
      icon: Sparkles,
      badge: null
    }
  ];

  const handleSelect = (id: string) => {
    setAnswer("timeline", id as TimelineEnum);
    setTimeout(nextStep, 300);
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">When do you need your website ready?</h2>
        <p className="text-neutral-400">This helps us allocate resources for your project.</p>
      </div>

      <div className="space-y-4">
        {options.map((option, index) => (
          <m.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(option.id)}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            
            <div className="relative p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 flex items-center justify-between group-hover:border-neutral-600 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-neutral-700 transition-all">
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-neutral-200 group-hover:text-white transition-colors">{option.label}</h3>
                  <p className="text-sm text-neutral-300 group-hover:text-neutral-400">{option.desc}</p>
                </div>
              </div>

              {option.badge && (
                <span className="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border border-white/20 bg-white/10 text-white">
                  {option.badge}
                </span>
              )}
            </div>
          </m.button>
        ))}
      </div>
    </div>
    </LazyMotion>
  );
};
