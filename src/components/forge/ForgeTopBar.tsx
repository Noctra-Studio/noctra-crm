"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { SearchBar } from "@/components/forge/SearchBar";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { NotificationsDropdown } from "@/components/forge/NotificationsDropdown";
import { AvatarDropdown } from "@/components/forge/modals/AvatarDropdown";
import { PerfilModal } from "@/components/forge/modals/PerfilModal";
import { SuscripcionModal } from "@/components/forge/modals/SuscripcionModal";
import { ConfiguracionesModal } from "@/components/forge/modals/ConfiguracionesModal";
import { EnvironmentBadge } from "@/components/forge/EnvironmentBadge";
import { createClient } from "@/utils/supabase/client";

export function ForgeTopBar({
  onOpenQuickActions,
}: {
  onOpenQuickActions: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null);

  const t = useTranslations("forge.dashboard");
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMFAStatus = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data) {
        setIs2FAEnabled(data.totp.some((f) => f.status === "verified"));
      }
    };
    fetchMFAStatus();
  }, [supabase]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    let periodo = t("buenas_noches");
    if (hour >= 6 && hour < 12) periodo = t("buenos_dias");
    else if (hour >= 12 && hour < 19) periodo = t("buenas_tardes");
    return t("saludo", { periodo, nombre: "Manu" });
  };

  const formattedDate = format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });

  return (
    <>
      <header className="hidden md:grid h-16 grid-cols-[1fr_2fr_1fr] items-center px-8 border-b border-white/5 shrink-0 sticky top-0 bg-[#050505] z-40">
        {/* Left Col: Greeting & Date */}
        <div className="flex items-center gap-3 justify-start">
          <h1 className="text-sm font-semibold text-white">{getGreeting()}</h1>
          <span className="text-white/20 hidden lg:inline">·</span>
          <p className="text-xs text-white/30 uppercase tracking-widest hidden lg:block">
            {formattedDate}
          </p>
        </div>

        {/* Center Col: Search Bar */}
        <div className="flex justify-center w-full px-4">
          <SearchBar onOpenCommandBar={onOpenQuickActions} />
        </div>

        {/* Right Col: Notifications & Avatar */}
        <div className="flex items-center gap-4 justify-end">
          <EnvironmentBadge />
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
            <LanguageSwitcher
              className="gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.24em]"
              inactiveClassName="text-white/45 hover:text-white/80"
              separatorClassName="text-white/20"
            />
          </div>
          <NotificationsDropdown leads={[]} proposals={[]} />

          <AvatarDropdown
            is2FAEnabled={is2FAEnabled}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenSubscription={() => setSubscriptionOpen(true)}
          />
        </div>
      </header>

      {/* Modals */}
      <PerfilModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <SuscripcionModal
        isOpen={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
      />
      <ConfiguracionesModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        is2FAEnabled={is2FAEnabled}
      />
    </>
  );
}
