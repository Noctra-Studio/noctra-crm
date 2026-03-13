"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import { ForgeTopBar } from "@/components/forge/ForgeTopBar";
import { ForgeContentWrapper } from "@/components/forge/ForgeContentWrapper";
import { ForgeMobileHeader } from "@/components/forge/ForgeMobileHeader";
import { CommandBar } from "@/components/forge/CommandBar";
import { Plus } from "lucide-react";
import { OnboardingWizard } from "@/components/forge/OnboardingWizard";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { canAccessCentralBrainRole } from "@/lib/ai/brain-access";

export default function ForgeLayoutClient({
  children,
  workspace,
  workspaceRole,
}: {
  children: React.ReactNode;
  workspace: any;
  workspaceRole?: string | null;
}) {
  const supabase = createClient(false); // Disable session persistence for forge
  const router = useRouter();
  const pathname = usePathname();
  const { showWarning, timeLeft, staySignedIn } = useInactivityTimeout();
  const [hasSession, setHasSession] = useState<boolean | null>(
    workspace ? true : null,
  );
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  const isLoginPage = pathname.includes("/login");
  const isSignupPage = pathname.includes("/signup");
  const isForgeRoot =
    /^\/(es|en)?\/?$/.test(pathname) || pathname === "/" || pathname === "/";
  // Only evaluate as landing page if we are certain there is no session.
  // If hasSession is null, we assume they MIGHT be logged in to prevent flickering the Landing Page UI.
  const isLandingPage = isForgeRoot && hasSession === false;

  useEffect(() => {
    // Check real session on mount (fixes Next.js layout prop caching after login)
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      if (data.session) {
        // Evaluate if onboarding is needed
        const onboardingCompleted =
          data.session.user.user_metadata?.onboarding_completed === true;
        setNeedsOnboarding(!onboardingCompleted);
      }
      setIsReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setHasSession(!!session);
      // Only redirect on SIGNED_OUT if they are inside the protected dashboard area, not the landing page
      if (event === "SIGNED_OUT" && !isForgeRoot) {
        router.push("/login");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, isForgeRoot]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandBarOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <>
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-300">
              You'll be signed out in {minutes}:
              {seconds.toString().padStart(2, "0")} due to inactivity.
            </p>
          </div>
          <button
            onClick={staySignedIn}
            className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-neutral-200 transition-colors">
            Stay signed in
          </button>
        </div>
      )}

      {isLoginPage || isLandingPage ? (
        children
      ) : (
        <>
          {/* DESKTOP LAYOUT - STRICT FLEX */}
          <div className="hidden md:flex h-dvh min-w-0 overflow-hidden bg-[#050505] text-white">
            <aside className="border-r border-white/5 shrink-0 flex flex-col">
              <ForgeSidebar workspace={workspace} enabled={!!hasSession} />
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden forge-scroll flex flex-col">
              <ForgeTopBar />
              <ForgeContentWrapper>{children}</ForgeContentWrapper>
            </main>
          </div>

          {/* MOBILE LAYOUT & FAB */}
          <div className="md:hidden flex min-w-0 flex-col h-dvh overflow-hidden bg-[#050505] text-white relative">
            <ForgeMobileHeader />
            <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+7rem)] forge-scroll flex flex-col relative">
              <ForgeContentWrapper>{children}</ForgeContentWrapper>
            </main>

            {/* Floating Action Button (FAB) */}
            <button
              onClick={() => setCommandBarOpen(true)}
              style={{
                right: "calc(env(safe-area-inset-right) + 1rem)",
                bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
              }}
              className="fixed w-14 h-14 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all active:scale-90 z-40"
              aria-label="Menú de creación rápida">
              <Plus className="w-8 h-8" strokeWidth={2.5} />
            </button>
          </div>

          {/* Global Command Bar */}
          <CommandBar
            isOpen={commandBarOpen}
            onClose={() => setCommandBarOpen(false)}
          />

          {/* Onboarding Wizard (Rendered Conditionally over the UI) */}
          {isReady &&
            needsOnboarding &&
            !isLoginPage &&
            !isSignupPage &&
            !isLandingPage && <OnboardingWizard />}

          {/* AI Chat Widget */}
          {hasSession && canAccessCentralBrainRole(workspaceRole) && <ChatWidget />}
        </>
      )}
    </>
  );
}
