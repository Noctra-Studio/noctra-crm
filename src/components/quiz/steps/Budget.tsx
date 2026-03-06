"use client";

import { useQuiz, Budget as BudgetEnum } from "../QuizContext";
import {
  DollarSign,
  AlertTriangle,
  Check,
  Zap,
  Building2,
  Briefcase,
} from "lucide-react";
import { LazyMotion, m, domAnimation } from "framer-motion";

export const Budget = () => {
  const { setAnswer, nextStep } = useQuiz();

  const options = [
    {
      id: "under-10k",
      label: "Under $10,000 MXN",
      desc: "Template-based solutions, DIY platforms",
      icon: AlertTriangle,
      badge: "Warning: Below starting price",
    },
    {
      id: "10k-25k",
      label: "$10,000 - $25,000 MXN",
      desc: "Professional website package",
      icon: Briefcase,
      badge: "Perfect for most businesses",
    },
    {
      id: "25k-50k",
      label: "$25,000 - $50,000 MXN",
      desc: "E-commerce or advanced features",
      icon: Zap,
      badge: "Online stores & custom",
    },
    {
      id: "50k-100k",
      label: "$50,000 - $100,000 MXN",
      desc: "Custom systems and automation",
      icon: Building2,
      badge: "Complex requirements",
    },
    {
      id: "100k-plus",
      label: "$100,000+ MXN",
      desc: "Enterprise solutions",
      icon: Building2,
      badge: "Full business platforms",
    },
    {
      id: "not-sure",
      label: "Not sure yet",
      desc: "Help me understand what I need",
      icon: DollarSign,
      color: "text-neutral-400",
      badge: "We'll recommend",
      badgeColor: "text-neutral-400 bg-neutral-500/10 border-neutral-500/20",
    },
  ];

  const handleSelect = (id: string) => {
    setAnswer("budget", id as BudgetEnum);
    setTimeout(nextStep, 300);
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          What&apos;s your budget range for this project?
        </h2>
        <p className="text-neutral-400">
          Budget transparency helps us suggest realistic solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => (
          <m.button
            key={option.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(option.id)}
            className="group relative p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-left hover:border-neutral-600 hover:bg-neutral-800 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                  <option.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-200 group-hover:text-white transition-colors">
                    {option.label}
                  </h3>
                  <p className="text-sm text-neutral-300 group-hover:text-neutral-400">
                    {option.desc}
                  </p>
                </div>
              </div>

              {option.badge && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-neutral-300">
                  {option.id === "under-10k" ? (
                    <AlertTriangle className="w-3 h-3 text-white" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  {option.badge}
                </div>
              )}
            </div>
          </m.button>
        ))}
      </div>
    </div>
    </LazyMotion>
  );
};
