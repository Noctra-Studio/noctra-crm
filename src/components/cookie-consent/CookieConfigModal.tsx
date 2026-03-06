"use client";

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { X, Shield, BarChart, Megaphone, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LazyMotion, m, domAnimation, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CookieConfigModalProps {
  onClose: () => void;
  onSave: (consent: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => void;
  initialValues?: {
    analytics: boolean;
    marketing: boolean;
  };
}

export function CookieConfigModal({ 
  onClose, 
  onSave, 
  initialValues = { analytics: true, marketing: false } 
}: CookieConfigModalProps) {
  const t = useTranslations("CookieConsent.modal");
  const [analytics, setAnalytics] = useState(initialValues.analytics);
  const [marketing, setMarketing] = useState(initialValues.marketing);

  const handleSave = () => {
    onSave({
      essential: true,
      analytics,
      marketing,
    });
  };

  const handleRejectAll = () => {
    onSave({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* MODAL */}
      <m.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-neutral-200 dark:border-neutral-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-900">
          <h2 id="cookie-modal-title" className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-neutral-300" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <p className="text-neutral-300 dark:text-neutral-400 text-sm leading-relaxed">
            {t("description")}{' '}
            <Link href="/cookie-policy" className="text-neutral-950 dark:text-white font-bold underline hover:no-underline">
              {t("policy_link")}
            </Link>.
          </p>

          {/* ESSENTIAL */}
          <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-1">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-950 dark:text-white">
                    {t("essential.title")}
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-widest font-black rounded-lg">
                    {t("essential.badge")}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 dark:text-neutral-400 mb-3 leading-relaxed">
                  {t("essential.description")}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(t.raw("essential.items") as string[]).map((item, i) => (
                    <li key={item} className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-tight">
                      <Check className="w-3 h-3 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ANALYTICS */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-1">
                <BarChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-950 dark:text-white">
                    {t("analytics.title")}
                  </h3>
                  <Toggle enabled={analytics} onChange={setAnalytics} />
                </div>
                <p className="text-xs text-neutral-300 dark:text-neutral-400 mb-3 leading-relaxed">
                  {t("analytics.description")}
                </p>
                <ul className="space-y-1.5 opacity-60">
                  {(t.raw("analytics.items") as string[]).map((item, i) => (
                    <li key={item} className="text-[10px] text-neutral-300 uppercase tracking-tight">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* MARKETING */}
          <div className="bg-white dark:bg-neutral-950 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 mt-1">
                <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-950 dark:text-white">
                    {t("marketing.title")}
                  </h3>
                  <Toggle enabled={marketing} onChange={setMarketing} />
                </div>
                <p className="text-xs text-neutral-300 dark:text-neutral-400 mb-3 leading-relaxed">
                  {t("marketing.description")}
                </p>
                <ul className="space-y-1.5 opacity-60">
                  {(t.raw("marketing.items") as string[]).map((item, i) => (
                    <li key={item} className="text-[10px] text-neutral-300 uppercase tracking-tight">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
          <Button 
            variant="outline" 
            onClick={handleRejectAll}
            className="flex-1 rounded-2xl py-6 border-neutral-200 dark:border-neutral-800 font-bold hover:bg-white dark:hover:bg-neutral-950"
          >
            {t("reject_all")}
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1 rounded-2xl py-6 bg-neutral-950 dark:bg-white text-white dark:text-black font-bold"
          >
            {t("save")}
          </Button>
        </div>
      </m.div>
    </div>
    </LazyMotion>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-neutral-400",
        enabled ? "bg-emerald-500" : "bg-neutral-200 dark:bg-neutral-800"
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-lg",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
