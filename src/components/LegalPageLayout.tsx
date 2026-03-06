"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  toc?: { title: string; href: string }[];
  children: React.ReactNode;
}

export function LegalPageLayout({ 
  title, 
  lastUpdated, 
  toc, 
  children 
}: LegalPageLayoutProps) {
  const t = useTranslations("LegalLayout");

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-32 pb-24">
      {/* SKIP LINK FOR ACCESSIBILITY */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white p-4 shadow-lg rounded-lg text-black font-bold">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* BREADCRUMB */}
          <nav className="flex items-center gap-2 text-sm text-neutral-300 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">{t("breadcrumb_home")}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-900 dark:text-neutral-300 font-medium" aria-current="page">{title}</span>
          </nav>

          {/* HEADER */}
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 dark:text-white mb-6">
              {title}
            </h1>
            <div className="inline-block bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-xl text-sm font-mono text-neutral-300 dark:text-neutral-400">
              {t("last_updated", { date: lastUpdated })}
            </div>
          </header>

          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            {/* TABLE OF CONTENTS - STICKY SIDEBAR */}
            {toc && toc.length > 0 && (
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-32 space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    {t("toc_title")}
                  </h3>
                  <nav className="flex flex-col gap-3">
                    {toc.map((item, index) => (
                      <a 
                        key={item.href} 
                        href={item.href}
                        className="text-sm text-neutral-300 hover:text-black dark:hover:text-white transition-colors py-1 border-l-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 pl-4"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* CONTENT AREA */}
            <article 
              id="main-content" 
              className={cn(
                "prose prose-neutral dark:prose-invert max-w-none",
                toc && toc.length > 0 ? "lg:col-span-9" : "lg:col-span-12"
              )}
            >
              {children}
            </article>
          </div>

          {/* LEGAL FOOTER */}
          <footer className="mt-24 pt-12 border-t border-neutral-100 dark:border-neutral-900 flex flex-col items-center text-center gap-6">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t("footer.title")}
              </h4>
              <p className="text-neutral-300">
                {t("footer.subtitle")}
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full px-8 bg-neutral-900 dark:bg-white dark:text-black">
              <Link href="/contact" className="flex items-center gap-2">
                {t("footer.cta")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </footer>
        </div>
      </div>

      {/* PRINT-FRIENDLY STYLES */}
      <style jsx global>{`
        @media print {
          .lg\\:grid, aside, nav, footer, button, .breadcrumb, .cta {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          h1 {
            font-size: 24pt !important;
            margin-bottom: 20pt !important;
          }
          h2 {
            font-size: 18pt !important;
            margin-top: 30pt !important;
          }
          p, li {
            font-size: 11pt !important;
          }
          a:after {
            content: " (" attr(href) ")";
            font-size: 9pt;
            color: #666;
          }
        }
      `}</style>
    </main>
  );
}
