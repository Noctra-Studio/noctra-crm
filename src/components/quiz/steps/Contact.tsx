"use client";

import { useQuiz } from "../QuizContext";
import { useState } from "react";
import { ArrowRight, Lock, Loader2 } from "lucide-react";

export const Contact = () => {
  const { answers, setAnswer, nextStep } = useQuiz();
  const [formData, setFormData] = useState({
    name: answers.contact?.name || "",
    email: answers.contact?.email || "",
    phone: answers.contact?.phone || "",
    company: answers.contact?.company || "",
    wantsConsultation: answers.contact?.wantsConsultation ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length < 2)
      newErrors.name = "Name is required";
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      newErrors.email = "Valid email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setAnswer("contact", formData);
    setIsSubmitting(false);
    nextStep();
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Last step! Where should we send your results?
        </h2>
        <p className="text-neutral-400">
          We'll also send a detailed PDF report.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Your Name *
              </label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full p-4 rounded-xl bg-neutral-900/50 border ${errors.name ? "border-red-500 focus:border-red-500" : "border-neutral-800 focus:border-white"} outline-none text-white transition-colors`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full p-4 rounded-xl bg-neutral-900/50 border ${errors.email ? "border-red-500 focus:border-red-500" : "border-neutral-800 focus:border-white"} outline-none text-white transition-colors`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 focus:border-white outline-none text-white transition-colors"
                placeholder="+52..."
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="company"
                className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Company (Optional)
              </label>
              <input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 focus:border-white outline-none text-white transition-colors"
                placeholder="Your Business Name"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`
              mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors
              ${formData.wantsConsultation ? "bg-white border-white text-black" : "border-neutral-700 bg-neutral-900 group-hover:border-neutral-500"}
            `}>
              <input
                type="checkbox"
                className="hidden"
                checked={formData.wantsConsultation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wantsConsultation: e.target.checked,
                  })
                }
              />
              {formData.wantsConsultation && <Check className="w-3.5 h-3.5" />}
            </div>
            <div className="text-sm text-neutral-300 group-hover:text-white transition-colors">
              I&apos;d like a{" "}
              <span className="text-white font-bold">
                free 15-min consultation
              </span>{" "}
              to discuss my project strategy.
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-white text-black font-black text-lg uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              See My Personalized Results <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-neutral-300 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Your information is secure. We never share your data.
          </p>
        </div>
      </form>
    </div>
  );
};

import { Check } from "lucide-react";
