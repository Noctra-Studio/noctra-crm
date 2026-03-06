"use client";

import { LazyMotion, m, domAnimation } from "framer-motion";
import { Link } from "@/i18n/routing";
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  DollarSign,
  PlusCircle
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ServicePageTemplateProps {
  namespace: string;
  interestId: string;
}

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </m.div>
);

const CustomTargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 200 200" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="4" fill="none" />
    <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="4" fill="none" />
    <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="4" fill="none" />
    <circle cx="100" cy="100" r="20" fill="currentColor" />
  </svg>
);

export default function ServicePageTemplate({ namespace, interestId }: ServicePageTemplateProps) {
  const t = useTranslations(`ServiceDetails.${namespace}`);
  const common = useTranslations("ServiceDetails.common");

  return (
    <LazyMotion features={domAnimation}>
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Hero */}
      <section className="pt-32 pb-24 px-6 md:px-8 border-b border-neutral-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <FadeIn>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-neutral-400 uppercase tracking-widest">
              {t("price")}
            </span>
          </FadeIn>
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
          >
            {t("title")}
          </m.h1>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t("subtitle")}
          </m.p>
          <FadeIn delay={0.3}>
            <Link
              href={{ pathname: "/contact", query: { intent: interestId } }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-neutral-200 transition-all group"
            >
              {common("cta_button")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-24 px-6 md:px-8 bg-white/[0.01] border-b border-neutral-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Para quién es esto
            </h2>
            <div className="space-y-6">
              {(t.raw("for_who") as string[]).map((item, i) => (
                <FadeIn key={item} delay={i * 0.1}>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <p className="text-lg text-neutral-300">{item}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="aspect-square rounded-3xl border border-neutral-800 bg-neutral-900/50 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-30" />
               <CustomTargetIcon className="w-32 h-32 text-neutral-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-24 px-6 md:px-8 border-b border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Qué incluye</h2>
            <p className="text-neutral-400">Enfoque en resultados reales, no solo características técnicas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(t.raw("what_includes") as string[]).map((item, i) => (
              <FadeIn key={item} delay={i * 0.1}>
                <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 transition-colors h-full">
                  <TrendingUp className="w-8 h-8 text-neutral-400 mb-6" />
                  <p className="text-xl font-medium leading-relaxed">{item}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6 md:px-8 bg-white/[0.01] border-b border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">{common("process")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { duration: "Week 1", label: "Discovery" },
              { duration: "Week 2-3", label: "Architecture" },
              { duration: "Week 4-5", label: "Development" },
              { duration: "Week 6", label: "Launch" }
            ].map((step, i) => (
              <FadeIn key={step.label} delay={i * 0.1}>
                <div className="relative pt-8">
                  <div className="absolute top-0 left-0 w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div className="mt-4">
                    <span className="block text-xs font-mono text-neutral-300 uppercase tracking-widest mb-1">{step.duration}</span>
                    <h3 className="text-lg font-bold">{step.label}</h3>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-24 px-6 md:px-8 border-b border-neutral-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">{t("investment.title")}</h2>
            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 space-y-4">
              <span className="text-4xl font-bold block">{t("investment.price")}</span>
              <div className="space-y-2">
                <div className="flex gap-2 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t("investment.includes")}</span>
                </div>
                <div className="flex gap-2 text-sm text-neutral-300">
                  <PlusCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t("investment.not_includes")}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-6">Módulos opcionales</h3>
            <div className="space-y-4">
              {(t.raw("investment.modules") as any[]).map((module, i) => (
                <div key={module.name} className="flex justify-between items-center p-4 rounded-xl border border-neutral-800 bg-neutral-900/30">
                  <span className="text-neutral-300">{module.name}</span>
                  <span className="font-mono text-emerald-400">{module.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Summary */}
      <section className="py-24 px-6 md:px-8 bg-emerald-500/[0.02] border-b border-neutral-900">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold">{common("guarantee_title")}</h2>
          <p className="text-lg text-neutral-400 leading-relaxed">
            {common("guarantee_desc")}
          </p>
          <Link href="/guarantee" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            {common("guarantee_link")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            {common("cta_title")}
          </h2>
          <Link
            href={{ pathname: "/contact", query: { intent: interestId } }}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:bg-neutral-200 transition-all group"
          >
            {common("cta_button")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </main>
    </LazyMotion>
  );
}
