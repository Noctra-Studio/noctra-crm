"use client";

import { useQuiz, BusinessType as BusinessTypeEnum } from "../QuizContext";
import { Stethoscope, Scale, Store, Factory, Briefcase, Hotel, HelpCircle } from "lucide-react";
import { LazyMotion, m, domAnimation } from "framer-motion";

export const BusinessType = () => {
  const { setAnswer, nextStep } = useQuiz();

  const options = [
    {
      id: "professional-services",
      icon: Stethoscope,
      label: "Professional Services",
      desc: "Doctors, dentists, accountants"
    },
    {
      id: "legal-consulting",
      icon: Scale,
      label: "Legal & Consulting",
      desc: "Lawyers, advisors, consultants"
    },
    {
      id: "retail-ecommerce",
      icon: Store,
      label: "Local Retail / E-commerce",
      desc: "Stores, online shops, boutiques"
    },
    {
      id: "manufacturing",
      icon: Factory,
      label: "Manufacturing & Custom",
      desc: "Workshops, production, industrial"
    },
    {
      id: "b2b-services",
      icon: Briefcase,
      label: "B2B Services / SaaS",
      desc: "Agencies, software, corporate"
    },
    {
      id: "hospitality",
      icon: Hotel,
      label: "Hospitality & Tourism",
      desc: "Hotels, restaurants, tours"
    },
    {
      id: "other",
      icon: HelpCircle,
      label: "Other / Not Sure",
      desc: "Tell us more about it later"
    },
  ];

  const handleSelect = (id: string) => {
    setAnswer("businessType", id as BusinessTypeEnum);
    setTimeout(nextStep, 300);
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">What type of business do you have?</h2>
        <p className="text-neutral-400">Select the option that best describes you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <m.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(option.id)}
            className={`
              relative p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 text-left transition-all duration-300 group
              hover:border-neutral-600 hover:bg-neutral-800
            `}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/5 text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <option.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-200 group-hover:text-white transition-colors">
                  {option.label}
                </h3>
                <p className="text-sm text-neutral-300 group-hover:text-neutral-400 transition-colors">
                  {option.desc}
                </p>
              </div>
            </div>
          </m.button>
        ))}
      </div>
    </div>
    </LazyMotion>
  );
};
