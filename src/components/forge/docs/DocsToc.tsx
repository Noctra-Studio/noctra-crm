"use client";

import { useEffect, useState } from "react";

export function DocsToc() {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([]);

  useEffect(() => {
    // Small delay to allow content to render
    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll("h2, h3"))
        .filter((el) => el.id)
        .map((el) => ({
          id: el.id,
          text: el.textContent || "",
          level: Number(el.tagName.charAt(1)),
        }));
      setHeadings(elements);
    }, 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0px -80% 0px" },
    );

    document.querySelectorAll("h2, h3").forEach((heading) => {
      if (heading.id) observer.observe(heading);
    });

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-48 shrink-0 sticky top-16 h-[calc(100vh-4rem)] py-8 pl-6 overflow-y-auto z-10 custom-scrollbar">
      <div className="space-y-4">
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/30">
          En esta página
        </span>
        <nav className="flex flex-col gap-2.5 relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5" />
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`text-[11px] leading-tight transition-all relative pl-3 font-medium ${
                activeId === heading.id
                  ? "text-emerald-400"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={{
                paddingLeft: heading.level === 3 ? "1.5rem" : "0.75rem",
              }}>
              {activeId === heading.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-full bg-emerald-500 rounded-full" />
              )}
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
