"use client";

import { useQuiz } from "../QuizContext";
import { useEffect, useState, useRef } from "react";
import {
  Check,
  ArrowRight,
  Download,
  Calendar,
  Mail,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { Link } from "@/i18n/routing";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

async function postQuizResults(payload: {
  name: string | undefined;
  email: string;
  phone: string | undefined;
  company: string | undefined;
  answers: unknown;
  recommendation: unknown;
}) {
  try {
    await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Failed to submit quiz:", err);
  }
}

export const Results = () => {
  const { calculateRecommendation, answers, closeQuiz } = useQuiz();
  const [result, setResult] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    const recommendation = calculateRecommendation();
    setResult(recommendation);

    if (!hasSubmittedRef.current && recommendation && answers.contact?.email) {
      hasSubmittedRef.current = true;
      postQuizResults({
        name: answers.contact?.name,
        email: answers.contact?.email,
        phone: answers.contact?.phone,
        company: answers.contact?.company,
        answers: answers,
        recommendation: recommendation,
      });
    }
  }, [calculateRecommendation, answers]);

  const handleDownloadPdf = async () => {
    const element = document.getElementById("results-content");
    if (!element) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#171717", // neutral-900
        logging: false,
        useCORS: true,
      } as any);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Noctra-Studio-Recommendation.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!result) return null;

  const DATA = {
    professional: {
      title: "PROFESSIONAL WEBSITE",
      price: "Starting at $20,000 MXN",
      timeline: "6 weeks",
      desc: "A high-conversion custom website designed to establish authority and generate leads.",
      features: [
        "Custom design & development",
        "Mobile-first responsive",
        "SEO optimization foundation",
        "60 days post-launch support",
        "Full code ownership",
      ],
      link: { pathname: "/services", query: { focus: "web_dev" } },
    },
    ecommerce: {
      title: "ONLINE STORE",
      price: "Starting at $35,000 MXN",
      timeline: "8 weeks",
      desc: "A robust e-commerce platform built to sell products 24/7 with automated inventory.",
      features: [
        "Shopify or Custom Cart",
        "Payment gateway integration",
        "Product taxonomy design",
        "Sales analytics dashboard",
        "Inventory management setup",
      ],
      link: { pathname: "/services", query: { focus: "ecommerce" } },
    },
    custom: {
      title: "CUSTOM SYSTEM",
      price: "Custom Quote",
      timeline: "12+ weeks",
      desc: "Tailor-made software to automate your specific business processes and workflows.",
      features: [
        "Complex database architecture",
        "User role management",
        "API integrations",
        "Automated workflows",
        "Scalable cloud infrastructure",
      ],
      link: { pathname: "/services", query: { focus: "ai" } },
    },
    optimization: {
      title: "OPTIMIZATION & GROWTH",
      price: "From $8,000 MXN/mo",
      timeline: "Ongoing",
      desc: "Continuous improvements to skyrocket your existing website's performance and rankings.",
      features: [
        "Technical SEO audits",
        "Speed performance tuning",
        "Conversion rate optimization",
        "Monthly analytics reports",
        "A/B testing strategies",
      ],
      link: { pathname: "/services", query: { focus: "seo" } },
    },
  } as const;

  const content = DATA[result.serviceId as keyof typeof DATA];

  return (
    <LazyMotion features={domAnimation}>
    <div className="h-full flex flex-col pt-4 md:pt-0" id="results-content">
      {/* Compact Header */}
      <div className="text-center mb-6 shrink-0 relative">
        <button
          onClick={closeQuiz}
          className="absolute right-0 top-0 p-2 text-neutral-300 hover:text-white md:hidden">
          <X className="w-5 h-5" />
        </button>
        <div className="inline-flex items-center gap-3 justify-center mb-2">
          <m.div
            initial={{ scale: 0.95, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </m.div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Perfect Match Found!
          </h2>
        </div>
        <p className="text-neutral-400 text-sm">
          Based on your answers, we recommend:
        </p>
      </div>

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1 min-h-0">
        {/* Scrollable Content Area within Card if needed, but aimed to fit */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid md:grid-cols-2 gap-6 h-full">
            {/* Left Column: Details */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-black text-white tracking-wider">
                    {content.title}
                  </h3>
                  <div className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest">
                    Recommended
                  </div>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {content.desc}
                </p>
              </div>

              <div className="flex items-center gap-4 py-3 border-y border-white/5">
                <div>
                  <div className="text-[9px] uppercase text-neutral-300 font-bold tracking-widest mb-0.5">
                    Investment
                  </div>
                  <div className="text-white font-mono font-bold text-sm">
                    {content.price}
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-[9px] uppercase text-neutral-300 font-bold tracking-widest mb-0.5">
                    Timeline
                  </div>
                  <div className="text-white font-mono font-bold text-sm">
                    {content.timeline}
                  </div>
                </div>
              </div>

              {/* Email Notification merged here */}
              <div className="bg-neutral-800/50 rounded-lg p-3 text-xs border border-white/5 mt-auto">
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="text-neutral-400">
                    Report sent to{" "}
                    <span className="text-white font-bold">
                      {answers.contact?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Features & Actions */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 rounded-xl p-4 flex-1">
                <h4 className="text-[10px] uppercase text-neutral-300 font-bold tracking-widest mb-3">
                  Included Features
                </h4>
                <ul className="space-y-2">
                  {content.features.map((feature, i) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <a
                  href="https://calendly.com/noctra-studio/discovery-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all text-center flex items-center justify-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Free Consultation
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={content.link}
                    target="_blank"
                    className="py-2.5 rounded-lg bg-white/5 border border-white/5 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-center flex items-center justify-center gap-1">
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="py-2.5 rounded-lg bg-white/5 border border-white/5 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-center flex items-center justify-center gap-1 disabled:opacity-50">
                    {isDownloading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-3 h-3" /> PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </m.div>
    </div>
    </LazyMotion>
  );
};
