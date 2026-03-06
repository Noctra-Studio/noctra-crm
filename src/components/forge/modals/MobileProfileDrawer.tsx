"use client";

import {
  LogOut,
  Settings,
  CreditCard,
  LifeBuoy,
  X,
  Kanban,
  StickyNote,
  Send,
  FileSignature,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function MobileProfileDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [userEmail, setUserEmail] = useState<string>("");
  const supabase = createClient(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email);
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/forge/login";
  };

  return (
    <>
      <div
        className={`md:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[110] bg-[#0A0A0A] border-t border-white/10 rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-2 transition-transform duration-300 ease-out flex flex-col max-h-[85dvh] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}>
        <div
          className="w-full flex justify-center py-3 cursor-pointer"
          onClick={onClose}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="px-6 flex flex-col overflow-y-auto forge-scroll">
          {/* User Info Header */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5 shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <span className="text-emerald-500 font-bold text-lg">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-white font-bold truncate">Mi Perfil</h3>
              <p className="text-sm text-neutral-400 truncate">{userEmail}</p>
            </div>
          </div>

          {/* CRM Links */}
          <div className="space-y-1 mb-6 pb-6 border-b border-white/5 shrink-0">
            <Link
              href="/forge/pipeline"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <Kanban className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Pipeline</span>
            </Link>
            <Link
              href="/forge/proposals"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <StickyNote className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Propuestas</span>
            </Link>
            <Link
              href="/forge/contracts"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <Send className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Contratos</span>
            </Link>
            <Link
              href="/forge/documents"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <FileSignature className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Documentos</span>
            </Link>
            <Link
              href="/forge/clients"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <UserCheck className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Clientes</span>
            </Link>
            <Link
              href="/forge/leads"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <Users className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Leads</span>
            </Link>
          </div>

          {/* Links */}
          <div className="space-y-1 mb-8 shrink-0">
            <Link
              href="/forge/settings/security"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <Settings className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Configuración</span>
            </Link>

            <Link
              href="/forge/settings/billing"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <CreditCard className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Facturación & Planes</span>
            </Link>

            <Link
              href="/forge/support"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-white">
              <LifeBuoy className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-sm">Soporte</span>
            </Link>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 text-red-500 text-sm tracking-wide font-bold hover:bg-red-500/20 transition-colors shrink-0 mb-4">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
