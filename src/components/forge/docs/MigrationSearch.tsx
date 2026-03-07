"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

export default function MigrationSearch({
  guides,
  locale,
}: {
  guides: any[];
  locale: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGuides = guides.filter(
    (guide) =>
      guide.platform.toLowerCase().includes(query.toLowerCase()) ||
      (guide.supportedEntities &&
        guide.supportedEntities.some((e: string) =>
          e.toLowerCase().includes(query.toLowerCase()),
        )),
  );

  return (
    <div className="relative max-w-xl" ref={ref}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          placeholder="Busca tu CRM actual (ej. HubSpot, Salesforce...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.length > 0 && (
        <div className="absolute mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
          {filteredGuides.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {filteredGuides.map((guide) => (
                <li key={guide._id}>
                  <Link
                    href={`/${locale}/docs/migracion/${guide.slug.current}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                    {guide.platformLogo ? (
                      <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center p-1.5 bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                        <Image
                          src={guide.platformLogo.asset.url}
                          alt={guide.platform}
                          width={24}
                          height={24}
                          className="object-contain filter grayscale group-hover:grayscale-0 transition-opacity"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg shrink-0 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                        {guide.platform.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-300 group-hover:text-white uppercase tracking-wider transition-colors">
                        {guide.platform}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                        {guide.tier === "tier1"
                          ? "Conexión directa"
                          : "Importación manual"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-400">
              No encontramos una guía específica para "{query}".
              <br />
              <Link
                href={`/${locale}/docs/migracion/universal-csv`}
                className="text-violet-400 hover:text-violet-300 mt-2 inline-block">
                Usa la Plantilla Universal →
              </Link>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-slate-500 mt-3">
        ¿No encuentras tu plataforma?{" "}
        <Link
          href={`/${locale}/docs/migracion/universal-csv`}
          className="text-violet-400 hover:text-violet-300 transition-colors">
          Usa la Plantilla Universal →
        </Link>
      </p>
    </div>
  );
}
