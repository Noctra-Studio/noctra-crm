"use client";

import { useState } from 'react';
import { Cookie } from 'lucide-react';
import { LazyMotion, m, domAnimation, AnimatePresence } from 'framer-motion';
import { CookieConfigModal } from './CookieConfigModal';
import { 
  getStoredConsent, 
  saveConsent,
  CookieConsent 
} from '@/lib/cookie-utils';
import { useTranslations } from 'next-intl';

export function CookieSettingsButton() {
  const t = useTranslations("CookieConsent");
  const [showModal, setShowModal] = useState(false);

  const handleOpenDetailed = () => {
    setShowModal(true);
  };

  const handleSavedDetailed = (consent: Omit<CookieConsent, 'timestamp' | 'version'>) => {
    saveConsent(consent);
    setShowModal(false);
    // Reload to apply script changes immediately if revoked
    window.location.reload();
  };

  const storedConsent = getStoredConsent();
  const initialValues = storedConsent ? {
    analytics: storedConsent.analytics,
    marketing: storedConsent.marketing
  } : undefined;

  return (
    <LazyMotion features={domAnimation}>
      <m.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpenDetailed}
        className="fixed bottom-6 right-6 z-[80] w-12 h-12 rounded-full bg-white dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-center text-neutral-950 dark:text-white hover:border-neutral-950 dark:hover:border-white transition-colors group"
        aria-label={t("floating_button")}
        title={t("floating_button")}
      >
        <Cookie className="w-5 h-5 group-hover:animate-pulse" />
      </m.button>

      <AnimatePresence>
        {showModal && (
          <CookieConfigModal 
            onClose={() => setShowModal(false)}
            onSave={handleSavedDetailed}
            initialValues={initialValues}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
