"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Cookie, Settings, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import {
  getStoredConsent,
  isConsentExpired,
  saveConsent,
  manageScripts,
  CookieConsent,
} from "@/lib/cookie-utils";
import { CookieConfigModal } from "./CookieConfigModal";

export function CookieBanner() {
  const t = useTranslations("CookieConsent.banner");
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setHasMounted(true);
      const consent = getStoredConsent();

      if (!consent || isConsentExpired(consent)) {
        setShowBanner(true);
      } else {
        manageScripts(consent);
      }
    }, 2500); // Completely defer from initial page load

    return () => clearTimeout(initTimer);
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      essential: true,
      analytics: true,
      marketing: false, // Marketing OFF by default for privacy
    };
    saveConsent(consent);
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    const consent = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(consent);
    setShowBanner(false);
  };

  const handleSavedDetailed = (
    consent: Omit<CookieConsent, "timestamp" | "version">,
  ) => {
    saveConsent(consent);
    setShowBanner(false);
    setShowModal(false);
  };

  if (!hasMounted) return null;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {showBanner && (
          <m.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-black/95 backdrop-blur-sm border-t border-white/10 shadow-2xl"
            role="dialog"
            aria-labelledby="cookie-banner-title">
            <div className="max-w-7xl mx-auto px-6 py-4 relative">
              {/* Botón cerrar */}
              <button
                onClick={handleEssentialOnly}
                className="absolute top-4 right-4 text-neutral-300 hover:text-white transition-colors p-1"
                aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 pr-8 md:pr-0">
                {/* Content */}
                <div className="flex items-center gap-3 flex-1">
                  <Cookie className="h-8 w-8 text-white flex-shrink-0" />
                  <div>
                    <h3
                      id="cookie-banner-title"
                      className="font-bold text-white mb-0.5 tracking-tight">
                      {t("title")}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {t("description")}{" "}
                      <Link
                        href="/cookie-policy"
                        className="text-white underline hover:text-white/80 transition-colors">
                        {t("policy_link")}
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Buttons - Igualmente prominentes (GDPR Compliant) */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                  <button
                    onClick={handleEssentialOnly}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all active:scale-[0.98]">
                    {t("essential_only")}
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Settings className="h-4 w-4" />
                    {t("configure")}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-black text-black bg-white rounded-xl hover:bg-neutral-200 transition-all active:scale-[0.98]">
                    {t("accept_all")}
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* DETAILED CONFIG MODAL */}
      <AnimatePresence>
        {showModal && (
          <CookieConfigModal
            onClose={() => setShowModal(false)}
            onSave={handleSavedDetailed}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
