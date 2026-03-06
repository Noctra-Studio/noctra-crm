"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, Settings, CreditCard, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";

interface AvatarDropdownProps {
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenSubscription: () => void;
  is2FAEnabled: boolean | null;
}

export function AvatarDropdown({
  onOpenProfile,
  onOpenSettings,
  onOpenSubscription,
  is2FAEnabled,
}: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("forge.avatar");
  const router = useRouter();
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      return;
    }
    router.push("/forge/login");
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 hover:bg-white/5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-white/10 relative">
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
          <User className="w-4 h-4 text-white/50" strokeWidth={1.5} />
        </div>

        {/* Disconnected 2FA Warning Dot */}
        {is2FAEnabled === false && (
          <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-[#050505] animate-pulse" />
        )}

        <div className="flex flex-col items-start leading-none gap-1 mr-1 hidden sm:flex">
          <span className="text-[11px] font-semibold text-white/90 truncate max-w-[100px]">
            Manu
          </span>
          <span className="text-[9px] font-mono text-white/40 truncate max-w-[100px]">
            Admin
          </span>
        </div>
        <ChevronDown
          className="w-3 h-3 text-white/30 hidden sm:block"
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-white/5 mb-2">
            <p className="text-xs text-white/50 font-mono">conectado como</p>
            <p className="text-sm font-semibold truncate mt-0.5">
              manu@noctra.com
            </p>
          </div>

          <div className="flex flex-col">
            <button
              onClick={() => handleAction(onOpenProfile)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors text-left">
              <User className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              {t("verPerfil")}
            </button>
            <button
              onClick={() => handleAction(onOpenSettings)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors text-left">
              <Settings className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              {t("configuraciones")}

              {/* Badge for inside Settings if no 2FA */}
              {is2FAEnabled === false && (
                <span className="ml-auto w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => handleAction(onOpenSubscription)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors text-left">
              <CreditCard className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              {t("suscripcion")}
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-white/5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left">
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              {t("cerrarSesion")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
