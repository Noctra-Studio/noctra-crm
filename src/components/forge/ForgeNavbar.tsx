"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  LazyMotion,
  m,
  domAnimation,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  Variants,
} from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useIntro } from "@/context/IntroContext";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ArrowLeft, ExternalLink } from "lucide-react";

export function ForgeNavbar() {
  const { isIntroComplete, initialized } = useIntro();
  const pathname = usePathname();
  const t = useTranslations("forge.navbar");

  const [isOpen, setIsOpen] = React.useState(false);
  const [lang, setLang] = React.useState<"es" | "en">("es");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { scrollY } = useScroll();
  const headerRef = React.useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash before intro check
  const isHomePage =
    pathname === "/" ||
    (pathname as string) === "/en" ||
    (pathname as string) === "/es";

  // If we are on /forge landing, we might want to match the "waiting for intro" behavior
  const shouldHide = !initialized;

  // Intro Visibility Control
  const showNavbar = isIntroComplete;

  // Close menu on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", (latest: any) => {
    if (typeof latest === "number" && latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  if (!mounted || shouldHide) return null;

  // --- DESKTOP VARIANTS (STRICT PARITY WITH Header.tsx) ---
  const desktopVariants: Variants = {
    closed: {
      height: "80px",
      borderRadius: "2rem",
      backgroundColor: isScrolled ? "rgba(5, 5, 5, 0.6)" : "rgba(5, 5, 5, 0)",
      backdropFilter: isScrolled ? "blur(12px)" : "none",
      border: isScrolled
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid transparent",
      opacity: 1,
    },
    open: {
      height: "600px",
      borderRadius: "2rem",
      backgroundColor: "rgba(5, 5, 5, 0.95)",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      opacity: 1,
    },
  };

  // --- MOBILE VARIANTS ---
  const mobileOverlayVariants: Variants = {
    closed: { y: "-100%" },
    open: {
      y: "0%",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: {
      y: "-100%",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  return createPortal(
    <LazyMotion features={domAnimation}>
      {/*
          --- MOBILE STICKY ARCHITECTURE (PARITY WITH HEADER.TSX) ---
          Layer 1: Background Blur (Z-40) - Controlled by scroll
      */}
      <m.div
        className="fixed top-0 left-0 w-full h-24 z-40 pointer-events-none md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-b border-white/5" />
      </m.div>

      {/* Layer 2: Mobile Controls (Z-[60]) - Always fixed, same as Header.tsx */}
      <div className="fixed top-6 left-6 z-[60] h-12 flex items-center md:hidden mix-blend-difference">
        <Link href="/forge" className="flex items-center gap-2">
          <BrandLogo className="w-[100px] h-auto text-white" />
          <span className="text-white font-mono text-[9px] mt-0.5 border-l border-white/20 pl-2 opacity-80 uppercase tracking-widest">
            FORGE
          </span>
        </Link>
      </div>

      <div className="fixed top-6 right-6 z-[60] h-12 flex items-center md:hidden mix-blend-difference">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors flex items-center gap-2">
            <ArrowLeft size={12} className="text-white" strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">
              SITIO
            </span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md border border-white/10"
            aria-label="Menu">
            <div
              className={cn(
                "w-5 h-[12px] flex flex-col justify-between transition-all duration-300",
                isOpen && "h-5 relative",
              )}>
              <span
                className={cn(
                  "w-full h-[1.5px] bg-white rounded-full transition-all duration-300",
                  isOpen && "absolute top-1/2 -rotate-45",
                )}
              />
              <span
                className={cn(
                  "w-full h-[1.5px] bg-white rounded-full transition-all duration-300",
                  isOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "w-full h-[1.5px] bg-white rounded-full transition-all duration-300",
                  isOpen && "absolute top-1/2 rotate-45",
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* --- DESKTOP HEADER (MD+) --- */}
      <m.header
        data-fixed-header
        className="fixed z-[50] top-0 left-0 right-0 w-full pointer-events-none hidden md:block"
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: showNavbar ? 0 : -20,
          opacity: showNavbar ? 1 : 0,
        }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}>
        <m.div
          ref={headerRef}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={desktopVariants}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1.2,
          }}
          className="relative z-50 overflow-hidden shadow-2xl pointer-events-auto mx-auto mt-6 w-full max-w-[1280px]">
          <div className="flex flex-col w-full h-full relative">
            <div className="flex items-center justify-between px-8 h-[80px] shrink-0 z-50 relative">
              {/* Left: Branding */}
              <Link
                href="/forge"
                className="relative z-50 hover:opacity-80 transition-opacity flex items-center gap-3">
                <BrandLogo className="h-8 w-auto text-white" showText={true} />
                <span className="text-emerald-500 font-mono text-[10px] border-l border-white/20 pl-3 uppercase tracking-[0.3em] font-bold">
                  FORGE
                </span>
              </Link>

              {/* Right: Actions */}
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
                  <ArrowLeft
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    strokeWidth={1.5}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t("back_to_home", { defaultValue: "Volver al sitio web" })}
                  </span>
                </Link>

                <m.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}>
                  <Link
                    href="/forge/login"
                    className="flex items-center justify-center px-8 py-2.5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                    {t("sign_in", { defaultValue: "Ingresar" })}
                  </Link>
                </m.div>

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  className="flex items-center gap-4 group cursor-pointer">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                    {isOpen ? "Cerrar" : "Menú"}
                  </span>
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors",
                    )}>
                    <div
                      className={cn(
                        "w-5 h-[12px] flex flex-col justify-between transition-all duration-300",
                        isOpen && "h-5 relative",
                      )}>
                      <span
                        className={cn(
                          "w-full h-[1.5px] bg-white transition-all duration-300",
                          isOpen && "absolute top-1/2 rotate-45",
                        )}
                      />
                      <span
                        className={cn(
                          "w-full h-[1.5px] bg-white transition-all duration-300",
                          isOpen && "opacity-0",
                        )}
                      />
                      <span
                        className={cn(
                          "w-full h-[1.5px] bg-white transition-all duration-300",
                          isOpen && "absolute top-1/2 -rotate-45",
                        )}
                      />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Expanded Menu Content (If needed, otherwise keep it simple) */}
            <AnimatePresence>
              {isOpen && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-[80px_0_0_0] bg-black/40 backdrop-blur-xl border-t border-white/5 p-12 overflow-y-auto">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                        Navegación
                      </h4>
                      <div className="flex flex-col gap-6">
                        <a
                          href="#features"
                          className="text-4xl font-bold text-white hover:text-emerald-500 transition-colors"
                          onClick={() => setIsOpen(false)}>
                          Producto
                        </a>
                        <a
                          href="#pricing"
                          className="text-4xl font-bold text-white hover:text-emerald-500 transition-colors"
                          onClick={() => setIsOpen(false)}>
                          Precios
                        </a>
                        <a
                          href="#migracion"
                          className="text-4xl font-bold text-white hover:text-emerald-500 transition-colors"
                          onClick={() => setIsOpen(false)}>
                          Migración
                        </a>
                        <Link
                          href="/blog"
                          className="text-4xl font-bold text-white hover:text-emerald-500 transition-colors"
                          onClick={() => setIsOpen(false)}>
                          Recursos
                        </Link>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                        Otros
                      </h4>
                      <div className="flex flex-col gap-6">
                        <a
                          href="mailto:hola@noctra.studio"
                          className="text-2xl font-bold text-white/60 hover:text-white transition-colors flex items-center gap-3"
                          onClick={() => setIsOpen(false)}>
                          <ExternalLink className="w-5 h-5" />
                          Soporte Técnico
                        </a>
                      </div>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </m.div>
      </m.header>

      {/* --- MOBILE CONTENT OVERLAY --- */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <m.div
            initial="closed"
            animate="open"
            exit="exit"
            variants={mobileOverlayVariants}
            className="fixed inset-0 z-[50] bg-[#050505]/95 backdrop-blur-2xl border-b border-white/10 flex flex-col pointer-events-auto overflow-hidden touch-none"
            style={{ overscrollBehavior: "none" }}>
            <div className="flex-1 flex flex-col justify-between w-full px-6 pb-24 pt-24">
              <div className="flex-1 flex flex-col items-center justify-center gap-10">
                <a
                  href="#features"
                  className="text-4xl font-bold text-white"
                  onClick={() => setIsOpen(false)}>
                  Producto
                </a>
                <a
                  href="#pricing"
                  className="text-4xl font-bold text-white"
                  onClick={() => setIsOpen(false)}>
                  Precios
                </a>
                <a
                  href="#migracion"
                  className="text-4xl font-bold text-white"
                  onClick={() => setIsOpen(false)}>
                  Migración
                </a>
                <Link
                  href="/blog"
                  className="text-4xl font-bold text-white"
                  onClick={() => setIsOpen(false)}>
                  Recursos
                </Link>

                <div className="w-12 h-px bg-white/10 my-4" />

                <a
                  href="mailto:hola@noctra.studio"
                  className="text-xl font-medium text-white/40 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}>
                  Soporte
                </a>
              </div>

              <div className="w-full pt-8 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
                  Noctra Forge v1.0
                </p>

                {/* Language Toggle */}
                <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                  <button
                    onClick={() => setLang("es")}
                    className={cn(
                      "px-4 py-1.5 text-[10px] font-black rounded-full transition-all",
                      lang === "es"
                        ? "bg-white text-black"
                        : "text-white/40 hover:text-white",
                    )}>
                    ES
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={cn(
                      "px-4 py-1.5 text-[10px] font-black rounded-full transition-all",
                      lang === "en"
                        ? "bg-white text-black"
                        : "text-white/40 hover:text-white",
                    )}>
                    EN
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>,
    document.body,
  );
}
